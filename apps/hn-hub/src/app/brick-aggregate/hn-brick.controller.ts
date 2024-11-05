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
import {
  BlFile,
  BlParsePipe,
  BlPublic,
  BlResponseHelper,
  BlRichTextUploadedImageResponse,
  BlUnauthorizedException,
  BlUploadedFile,
} from '@monorepo/back-core-lib';
import { HnBrick } from './brick/hn-brick.entity';
import { HnNewVersionDTO } from './brick-version/hn-brick-version.entity';
import { HnDocumentationSearchDTO } from './documentation/hn-documentation.entity';
import { HnNode } from './folder/hn-folder.dto';
import {
  HnBrickDto,
  HnBrickVersionDownloadDTO,
  HnCreateBrickDTO,
  HnCreateTechnicalDocContent,
  HnEditBrickDTO,
  HnIsActualBrickAndNewVersionDTO,
  HnTechnicalDocInputDTO,
} from './brick/hn-brick.dto';
import { HnIsAdminGuard } from '../core/guards/hn-is-admin.guard';
import { Request, Response } from 'express';
import { HnBrickAggregateService } from './hn-brick-aggregate.service';
import { HnSitemapItemBase } from '../core/model/config/hn-site-map.class';
import { ClPage } from '@monorepo/core-lib';
import { FileInterceptor } from '@nestjs/platform-express';
import { HnDocumentationDto } from './documentation/hn-documentation.dto';
import { HnGeneratedDocDto } from '../core/model/entities/hn-generated-doc.dto';
import { HnBrickVersionDto } from './brick-version/hn-brick-version.dto';
import { HnBrickUserInviteDto } from './brick-user-invite/hn-brick-user-invite.dto';
import { HnUserDto } from '../users/hn-user.dto';
import { HnCoreConfigService } from '../core/modules/core-config/hn-core-config.service';

@Controller('brick')
@UseGuards(HnIsAdminGuard)
export class HnBrickController {
  constructor(
    private readonly brickAggregateService: HnBrickAggregateService,
    private readonly configService: HnCoreConfigService
  ) {}

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

  /**
   * Special route that is called by the lab using the central API key to retrieve info about the brick.
   * If the key is present and valid, private bricks can be accessed.
   */
  @BlPublic()
  @Get('central/name/:name/:version')
  findOneByNameCentral(
    @Param('name') name: string,
    @Param('version') version: string,
    @Req() request: Request
  ): Promise<HnBrickVersionDownloadDTO> {
    return this.brickAggregateService.findBrickByNameCentral(name, version, request.header('X-Api-Key'));
  }

  @BlPublic()
  @Get('docs/:brickId/:version')
  async findDocsByBrick(
    @Param('brickId') brickId: string,
    @Param('version') version: string
  ): Promise<HnNode> {
    return this.brickAggregateService.findDocsByBrick(brickId, version);
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
    @Query('page', new ParseIntPipe()) page: number,
    @Query('size', new ParseIntPipe()) size: number
  ): Promise<ClPage<HnBrickDto>> {
    return this.brickAggregateService.findBricksWithFilter(spacesFilter, titleFilter, page, size);
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
  @Post('central-filters')
  async getBricksByFilterFromCentral(
    @Body('spacesFilter') spacesFilter: string[],
    @Body('titleFilter') titleFilter: string,
    @Query('page', new ParseIntPipe()) page: number,
    @Query('size', new ParseIntPipe()) size: number,
    @Body('userId') userId: string,
    @Req() request: Request
  ): Promise<ClPage<HnBrickDto>> {
    const centralApiKey = request.header('X-Api-Key');
    if (centralApiKey == null || this.configService.getCentralApiKey() !== centralApiKey) {
      throw new BlUnauthorizedException();
    }
    return this.brickAggregateService.findBricksWithFilter(spacesFilter, titleFilter, page, size, userId);
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
  ): Promise<HnGeneratedDocDto> {
    return this.brickAggregateService.findTechDocByPath(input);
  }

  @Post('new-version')
  createNewVersion(
    @Body(new BlParsePipe(HnNewVersionDTO)) newVersion: HnNewVersionDTO
  ): Promise<HnNewVersionDTO> {
    return this.brickAggregateService.createNewVersion(newVersion);
  }

  @BlPublic()
  @Get('versions-list/:brickId')
  public getVersionsList(@Param('brickId') brickId: string): Promise<string[]> {
    return this.brickAggregateService.getVersionsList(brickId);
  }

  @BlPublic()
  @Post('central-versions-list/:brickId')
  public getVersionsListForCentral(
    @Param('brickId') brickId: string,
    @Body('userId') userId: string,
    @Req() request: Request
  ): Promise<string[]> {
    const centralApiKey = request.header('X-Api-Key');
    if (centralApiKey == null || this.configService.getCentralApiKey() !== centralApiKey) {
      throw new BlUnauthorizedException();
    }
    return this.brickAggregateService.getVersionsList(brickId, userId);
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
  ): Promise<BlRichTextUploadedImageResponse> {
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
    @Body(new BlParsePipe(HnIsActualBrickAndNewVersionDTO))
    content: HnIsActualBrickAndNewVersionDTO
  ): Promise<[boolean, boolean]> {
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
    @Body('coAuthorMail') coAuthorMail: string
  ): Promise<HnBrick> {
    return this.brickAggregateService.inviteBrickCoAuthor(id, coAuthorMail);
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

  @BlPublic()
  @Post('central-name/:name')
  async findOneByNameCentralClean(
    @Param('name') name: string,
    @Body('userId') userId: string,
    @Req() request: Request
  ): Promise<HnBrickDto> {
    const centralApiKey = request.header('X-Api-Key');
    if (centralApiKey == null || this.configService.getCentralApiKey() !== centralApiKey) {
      throw new BlUnauthorizedException();
    }
    return new HnBrickDto(await this.brickAggregateService.findBrickByName(name, userId));
  }
}
