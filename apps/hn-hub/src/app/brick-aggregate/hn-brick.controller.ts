import {Body, Controller, Delete, Get, Param, ParseUUIDPipe, Post, Put, Req, UseGuards} from '@nestjs/common';
import {BlParsePipe, BlPublic} from '@monorepo/back-core-lib';
import {HnBrick} from './brick/hn-brick.entity';
import {HnBrickVersion, HnNewVersionDTO} from './brick-version/hn-brick-version.entity';
import {HnDocumentation, HnDocumentationSearchDTO} from './documentation/hn-documentation.entity';
import {HnNode} from './folder/hn-folder.dto';
import {
  HnBrickListDTO,
  HnBrickVersionDownloadDTO,
  HnCreateBrickDTO,
  HnCreateTechnicalDocContent,
  HnEditBrickDTO,
  HnIsActualBrickAndNewVersionDTO,
  HnTechnicalDocInputDTO
} from './brick/hn-brick.dto';
import {HnGeneratedDocEntity} from '../core/model/entities/hn-generated-doc.entity';
import {HnIsAdminGuard} from '../core/guards/hn-is-admin.guard';
import {IsAdmin} from '../core/decorators/hn-is-admin.decorator';
import {Request} from 'express';
import {HnBrickAggregateService} from './hn-brick-aggregate.service';
import {HnBrickUser} from './brick-user/hn-brick-user.entity';
import {HnBrickUserInvite} from './brick-user-invite/hn-brick-user-invite.entity';
import {HnSitemapItemBase} from '../core/model/config/hn-site-map.class';

@Controller('brick')
@UseGuards(HnIsAdminGuard)
export class HnBrickController {
  constructor(private readonly brickAggregateService: HnBrickAggregateService) {
  }

  @BlPublic()
  @Get()
  find(): Promise<HnBrickListDTO[]> {
    return this.brickAggregateService.findBricks();
  }

  @BlPublic()
  @Get('all-map')
  findAllMap(): Promise<HnSitemapItemBase[]> {
    return this.brickAggregateService.findAllMap();
  }


  @BlPublic()
  @Get('name/:name')
  findOneByName(@Param('name') name: string): Promise<HnBrick> {
    return this.brickAggregateService.findBrickByName(name);
  }

  /**
   * Special route that is called by the lab using the central API key to retrieve info about the brick.
   * If the key is present and valid, private bricks can be accessed.
   */
  @BlPublic()
  @Get('central/name/:name/:version')
  findOneByNameCentral(@Param('name') name: string,
                       @Param('version') version: string,
                       @Req() request: Request): Promise<HnBrickVersionDownloadDTO> {
    return this.brickAggregateService.findBrickByNameCentral(name, version, request.header('X-Api-Key'));
  }

  @BlPublic()
  @Get('docs/:brickId/:version')
  async findDocsByBrick(@Param('brickId') brickId: string, @Param('version') version: string): Promise<HnNode> {
    return this.brickAggregateService.findDocsByBrick(brickId, version);
  }

  @BlPublic()
  @Get('root-folder/:brickId/:version')
  async findRootFolderId(@Param('brickId') brickId: string, @Param('version') version: string): Promise<{
    id: string
  }> {
    return this.brickAggregateService.findRootFolderId(brickId, version);
  }

  @BlPublic()
  @Post('doc/:brickName/:version')
  async findCurrentDoc(@Param('brickName') brickName: string,
                       @Param('version') version: string,
                       @Body() body: any): Promise<HnDocumentation | any> {
    return this.brickAggregateService.findCurrentDoc(brickName, version, body);
  }

  @BlPublic()
  @Get('first-doc/:brickName/:version')
  async findFirstDoc(@Param('brickName') brickName: string,
                     @Param('version') version: string): Promise<HnDocumentation> {
    return this.brickAggregateService.findFirstDoc(brickName, version);
  }

  @IsAdmin()
  @Post()
  create(@Body(new BlParsePipe(HnCreateBrickDTO)) createBrick: HnCreateBrickDTO): Promise<HnBrick> {
    return this.brickAggregateService.createBrick(createBrick);
  }

  @Post('create-technical-doc')
  async createTechnicalDoc(@Body(new BlParsePipe(HnCreateTechnicalDocContent)) content: HnCreateTechnicalDocContent): Promise<boolean> {
    return this.brickAggregateService.createTechnicalDoc(content);
  }

  @BlPublic()
  @Get('technical-doc/:brickId/:version')
  async findTechnicalDoc(@Param('brickId') brickId: string, @Param('version') version: string): Promise<HnNode> {
    return this.brickAggregateService.findTechnicalDoc(brickId, version);
  }

  @BlPublic()
  @Post('technical-doc-by-path')
  async findTechDocByPath(@Body(new BlParsePipe(HnTechnicalDocInputDTO)) input: HnTechnicalDocInputDTO): Promise<HnGeneratedDocEntity> {
    return this.brickAggregateService.findTechDocByPath(input);
  }

  @Post('new-version')
  createNewVersion(@Body(new BlParsePipe(HnNewVersionDTO)) newVersion: HnNewVersionDTO): Promise<HnNewVersionDTO> {
    return this.brickAggregateService.createNewVersion(newVersion);
  }

  @BlPublic()
  @Get('latest/:brickName')
  public getLatestBrickVersion(@Param('brickName') brickName: string): Promise<HnBrickVersion> {
    return this.brickAggregateService.getLatestBrickVersion(brickName);
  }

  @Put('edit')
  public editBrick(@Body(new BlParsePipe(HnEditBrickDTO)) editedBrick: HnEditBrickDTO): Promise<HnBrick> {
    return this.brickAggregateService.editBrick(editedBrick);
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
    @Param('major') major: string): Promise<HnDocumentationSearchDTO[]> {
    return this.brickAggregateService.getDocsByBrickNameMajor(brickName, major);
  }

  @Post('get-doc-by-link')
  async getDocByLink(@Body() body: any): Promise<HnDocumentationSearchDTO> {
    return this.brickAggregateService.getDocByLink(body.link);
  }

  /***
   * Update brick users
   */
  @Put(':id/invite-user')
  async updateStoryCoAuthors(@Param('id', new ParseUUIDPipe()) id: string,
                             @Body() body: any): Promise<HnBrick> {
    return this.brickAggregateService.updateBrickUsers(id, body.email);
  }

  /***
   * Remove brick user
   */
  @Delete('remove-brick-user/:brickUserId')
  async removeBrickUser(@Param('brickUserId', new ParseUUIDPipe()) brickUserId: string): Promise<boolean> {
    return this.brickAggregateService.removeBrickUser(brickUserId);
  }

  /***
   * Is brick user invite valid
   */
  @Get('invite/:token/is-valid')
  isBrickUserInviteValid(@Param('token') token: string): Promise<HnBrickUserInvite> {
    return this.brickAggregateService.isBrickUserInviteValid(token);
  }

  /***
   * Accept brick user invite
   */
  @Put('invite/:token/accept')
  acceptBrickUserInvite(@Param('token') token: string): Promise<HnBrick> {
    return this.brickAggregateService.acceptBrickUserInvite(token);
  }

  /***
   * Get brick users
   */
  @Get(':id/users')
  async getBrickUsers(@Param('id', new ParseUUIDPipe()) id: string): Promise<HnBrickUser[]> {
    return this.brickAggregateService.getBrickUsers(id);
  }


}
