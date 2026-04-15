import {
  BlFile,
  BlFileResponse,
  BlParsePipe,
  BlPublic,
  BlResponseHelper,
  BlSearchParams,
  BlSearchSortCriteria,
  BlUploadedFile,
} from '@monorepo/back-core-lib';
import { ClPage } from '@monorepo/core-lib';
import { TeBlockFigureUploadedResponse } from '@monorepo/te-text-editor';
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  ParseUUIDPipe,
  Post,
  Put,
  Query,
  Req,
  Res,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Request, Response } from 'express';

import { IsAdmin } from '../core/decorators/hn-is-admin.decorator';
import { HnIsAdminGuard } from '../core/guards/hn-is-admin.guard';
import { HnSitemapItemBase } from '../core/model/config/hn-site-map.class';
import { HnSimpleGeneratedDocDto } from '../core/model/entities/hn-generated-doc.dto';
import { HnGeneratedDocEntity } from '../core/model/entities/hn-generated-doc-typing.entity';
import { HnUserDto } from '../users/hn-user.dto';
import {
  HnBrickDto,
  HnCreateBrickDTO,
  HnCreateTechnicalDocContent,
  HnEditBrickDTO,
  HnIsActualBrickAndNewVersionDTO,
  HnIsActualBrickAndNewVersionResponseDTO,
  HnTechnicalDocInputDTO,
} from './brick/hn-brick.dto';
import { HnBrick } from './brick/hn-brick.entity';
import { HnBrickUserInviteDto } from './brick-user-invite/hn-brick-user-invite.dto';
import { HnBrickVersionDto } from './brick-version/hn-brick-version.dto';
import { HnBrickSettingsDTO, HnNewVersionDTO } from './brick-version/hn-brick-version.entity';
import { HnDocumentationDto, HnDocumentationShortDto } from './documentation/hn-documentation.dto';
import { HnDocumentation, HnDocumentationSearchDTO } from './documentation/hn-documentation.entity';
import { HnNode } from './folder/hn-folder.dto';
import { HnBrickAggregateService } from './hn-brick-aggregate.service';

@Controller('brick')
@UseGuards(HnIsAdminGuard)
export class HnBrickController {
  constructor(private readonly brickAggregateService: HnBrickAggregateService) {}

  @IsAdmin()
  @Post('search')
  async search(
    @Body(new BlParsePipe(BlSearchParams)) searchParams: BlSearchParams,
    @Query('page', new ParseIntPipe()) page: number,
    @Query('size', new ParseIntPipe()) size: number
  ): Promise<ClPage<HnBrickDto>> {
    const bricks = await this.brickAggregateService.search(searchParams, page, size);
    return bricks.map((brick) => new HnBrickDto(brick));
  }

  @IsAdmin()
  @Get('download-docs-zip/:brickId')
  async downloadDocsZip(
    @Param('brickId', new ParseUUIDPipe()) brickId: string,
    @Res() res: Response
  ): Promise<any> {
    const zip: BlFileResponse = await this.brickAggregateService.downloadDocsZip(brickId);
    res.set({
      'Content-Disposition': `attachment; filename="${zip.name}"`,
    });
    BlResponseHelper.setFileResponse(res, zip);
  }

  @BlPublic()
  @Get('all-map')
  findAllMap(): Promise<HnSitemapItemBase[]> {
    return this.brickAggregateService.findAllMap();
  }

  @BlPublic()
  @Get('name/:name')
  async findOneByName(@Param('name') name: string): Promise<HnBrickDto> {
    return new HnBrickDto(await this.brickAggregateService.findBrickByName(name));
  }

  @BlPublic()
  @Get('check-brick-existence/:name')
  async checkBrickExistence(@Param('name') name: string): Promise<boolean> {
    return this.brickAggregateService.checkIfBrickExistence(name);
  }

  @BlPublic()
  @Get('docs/:brickId/:version')
  async findDocsNodeByBrick(
    @Param('brickId') brickId: string,
    @Param('version') version: string
  ): Promise<HnNode> {
    return this.brickAggregateService.findDocsNodeByBrick(brickId, version);
  }

  @BlPublic()
  @Get('all-docs/:brickName/:version')
  async findAllDocsByBrick(
    @Param('brickName') brickName: string,
    @Param('version') version: string
  ): Promise<HnDocumentationShortDto[]> {
    const documentations: HnDocumentation[] = await this.brickAggregateService.findAllDocsByBrick(
      brickName,
      version
    );
    return documentations.map((doc) => new HnDocumentationShortDto(doc));
  }

  @BlPublic()
  @Get('all-technical-docs/:brickName/:version')
  async findAllTechnicalDocsByBrick(
    @Param('brickName') brickName: string,
    @Param('version') version: string
  ): Promise<Record<string, HnSimpleGeneratedDocDto[]>> {
    const technicalDocumentations: Record<string, HnGeneratedDocEntity[]> =
      await this.brickAggregateService.findAllTechnicalDocsByBrick(brickName, version);
    const result: Record<string, HnSimpleGeneratedDocDto[]> = {};
    for (const key of Object.keys(technicalDocumentations)) {
      result[key] = technicalDocumentations[key].map((doc) => new HnSimpleGeneratedDocDto(doc));
    }
    return result;
  }

  @BlPublic()
  @Get('root-folder/:brickId/:version')
  async findRootFolderId(
    @Param('brickId') brickId: string,
    @Param('version') version: string
  ): Promise<{
    id: string;
  }> {
    return this.brickAggregateService.findRootFolderId(brickId, version);
  }

  @BlPublic()
  @Post('filters')
  async getBricksByFilter(
    @Body('spacesFilter') spacesFilter: string[],
    @Body('titleFilter') titleFilter: string,
    @Body('sorts') sortsCriteria: BlSearchSortCriteria[],
    @Query('page', new ParseIntPipe()) page: number,
    @Query('size', new ParseIntPipe()) size: number
  ): Promise<ClPage<HnBrickDto>> {
    return this.brickAggregateService.findBricksWithFilter(
      spacesFilter,
      titleFilter,
      sortsCriteria,
      page,
      size
    );
  }

  /**
   * Get user bricks
   * @param userId
   * @param page
   * @param size
   * @return bricks
   */
  @BlPublic()
  @Get('user/:userId')
  getUserBricks(
    @Param('userId', ParseUUIDPipe) userId: string,
    @Query('page', new ParseIntPipe()) page: number,
    @Query('size', new ParseIntPipe()) size: number
  ): Promise<ClPage<HnBrickDto>> {
    return this.brickAggregateService.findUserBricks(userId, page, size);
  }

  @BlPublic()
  @Get('first-doc/:brickName/:version')
  async findFirstDoc(
    @Param('brickName') brickName: string,
    @Param('version') version: string
  ): Promise<HnDocumentationDto> {
    return this.brickAggregateService.findFirstDoc(brickName, version);
  }

  @Post()
  create(@Body(new BlParsePipe(HnCreateBrickDTO)) createBrick: HnCreateBrickDTO): Promise<HnBrick> {
    return this.brickAggregateService.createBrick(createBrick);
  }

  @Post('create-technical-doc')
  async createTechnicalDoc(
    @Body(new BlParsePipe(HnCreateTechnicalDocContent)) content: HnCreateTechnicalDocContent
  ): Promise<boolean> {
    return this.brickAggregateService.createTechnicalDoc(content);
  }

  @BlPublic()
  @Get('technical-doc/:brickId/:version')
  async findTechnicalDoc(
    @Param('brickId') brickId: string,
    @Param('version') version: string
  ): Promise<HnNode> {
    return this.brickAggregateService.findTechnicalDoc(brickId, version);
  }

  @BlPublic()
  @Post('technical-doc-by-path')
  async findTechDocByPath(
    @Body(new BlParsePipe(HnTechnicalDocInputDTO)) input: HnTechnicalDocInputDTO
  ): Promise<HnGeneratedDocEntity> {
    return this.brickAggregateService.findTechDocByPath(input);
  }

  @Post('version-from-settings')
  createVersionFromSettings(
    @Body(new BlParsePipe(HnBrickSettingsDTO)) settings: HnBrickSettingsDTO
  ): Promise<HnNewVersionDTO> {
    return this.brickAggregateService.createVersionFromSettings(settings);
  }

  @BlPublic()
  @Get('versions-list/:brickId')
  public getVersionsList(@Param('brickId') brickId: string): Promise<string[]> {
    return this.brickAggregateService.getVersionsList(brickId);
  }

  @BlPublic()
  @Get('latest/:brickName')
  public async getLatestBrickVersion(@Param('brickName') brickName: string): Promise<HnBrickVersionDto> {
    return new HnBrickVersionDto(await this.brickAggregateService.getLatestBrickVersion(brickName));
  }

  @UseInterceptors(FileInterceptor('file'))
  @Put('edit-image/:brickId')
  async editImage(
    @Param('brickId', new ParseUUIDPipe()) brickId: string,
    @BlUploadedFile() file: BlFile
  ): Promise<TeBlockFigureUploadedResponse> {
    return this.brickAggregateService.editBrickImage(brickId, file);
  }

  @BlPublic()
  @Get('image/*')
  public async getImage(@Req() request: Request, @Res() response: Response): Promise<any> {
    const splitIndex = request.url.indexOf('image/');
    const filename = request.url.slice(splitIndex + 6);
    const file = await this.brickAggregateService.getBrickImage(filename);
    BlResponseHelper.setFileResponseAndCache(response, file);
  }

  @Delete('image/*')
  public async deleteImage(@Req() request: Request): Promise<void> {
    const splitIndex = request.url.indexOf('image/');
    const filename = request.url.slice(splitIndex + 6);
    await this.brickAggregateService.deleteBrickImage(filename);
  }

  @Put('edit')
  public editBrick(@Body(new BlParsePipe(HnEditBrickDTO)) editedBrick: HnEditBrickDTO): Promise<HnBrick> {
    return this.brickAggregateService.editBrick(editedBrick);
  }

  @BlPublic()
  @Post('check-user-rights')
  public checkUserRights(
    @Body('brickId', new ParseUUIDPipe()) brickId: string,
    @Body('fullRight') fullRight: boolean = true
  ): Promise<boolean> {
    return this.brickAggregateService.checkIfUserCanEditBrick(brickId, fullRight);
  }

  @Post('is-actual-brick-and-new-version')
  async isActualBrickAndNewVersion(
    @Body(new BlParsePipe(HnIsActualBrickAndNewVersionDTO)) content: HnIsActualBrickAndNewVersionDTO
  ): Promise<HnIsActualBrickAndNewVersionResponseDTO> {
    return this.brickAggregateService.isActualBrickAndNewVersion(content);
  }

  @Get('get-docs-by-name/:brickName/:major')
  async getDocsByBrickNameMajor(
    @Param('brickName') brickName: string,
    @Param('major') major: string
  ): Promise<HnDocumentationSearchDTO[]> {
    return this.brickAggregateService.getDocsByBrickNameMajor(brickName, major);
  }

  @Post('get-doc-by-link')
  async getDocByLink(@Body() body: any): Promise<HnDocumentationSearchDTO> {
    return this.brickAggregateService.getDocByLink(body.link);
  }

  /***
   * Is brick user invite valid
   */
  @Get('invite/:token/is-valid')
  isBrickUserInviteValid(@Param('token') token: string): Promise<HnBrickUserInviteDto> {
    return this.brickAggregateService.isBrickUserInviteValid(token);
  }

  /***
   * Update brick users
   */
  @Post(':id/invite-co-author')
  async inviteBrickCoAuthor(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body('emailOrId') emailOrId: string
  ): Promise<HnBrick> {
    return this.brickAggregateService.inviteBrickCoAuthor(id, emailOrId);
  }

  /***
   * Accept brick user invite
   */
  @Put('invite/:token/accept')
  acceptBrickUserInvite(@Param('token') token: string): Promise<HnBrick> {
    return this.brickAggregateService.acceptBrickUserInvite(token);
  }

  @Delete('invite/:inviteId')
  async deleteCoAuthorInvite(@Param('inviteId', new ParseUUIDPipe()) inviteId: string): Promise<boolean> {
    return this.brickAggregateService.deleteCoAuthorInvite(inviteId);
  }

  @BlPublic()
  @Get(':id/co-authors')
  async getBrickCoAuthors(@Param('id', new ParseUUIDPipe()) id: string): Promise<HnUserDto[]> {
    return (await this.brickAggregateService.getBrickCoAuthors(id)).map(
      (brickCoAuthor) => new HnUserDto(brickCoAuthor.user)
    );
  }

  @Get(':id/co-authors-pending-invites')
  async getBrickCoAuthorsPendingInvites(
    @Param('id', new ParseUUIDPipe()) id: string
  ): Promise<HnBrickUserInviteDto[]> {
    return this.brickAggregateService.getBrickCoAuthorsPendingInvites(id);
  }

  @Put(':id/remove-co-author/:brickAuthorUserId')
  async removeBrickCoAuthor(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Param('brickAuthorUserId', new ParseUUIDPipe()) brickAuthorUserId: string
  ): Promise<void> {
    return this.brickAggregateService.removeBrickCoAuthor(id, brickAuthorUserId);
  }
}
