import {
  BlFile,
  BlParsePipe,
  BlPublic,
  BlResponseHelper,
  BlSearchSortCriteria,
  BlUploadedFile,
} from '@monorepo/back-core-lib';
import { ClPage } from '@monorepo/core-lib';
import {
  TeBlockFigureUploadedResponse,
  TeBlockFileUploadResponse,
  TeRichTextDTO,
} from '@monorepo/te-text-editor';
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
  Res,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Response } from 'express';

import { HnSitemapItemBase } from '../core/model/config/hn-site-map.class';
import { HnFileAppService } from '../file-aggregate/file-app/hn-file-app.service';
import { HnAbstractFileController } from '../file-aggregate/file-core/hn-abstract-file.controller';
import { HnUserDto } from '../users/hn-user.dto';
import { HnCommunityAppDto, HnCommunityAppEditDto } from './community-app/hn-community-app.dto';
import { HnCommunityApp } from './community-app/hn-community-app.entity';
import { HnCommunityAppCoAuthorInvite } from './community-app-co-author-invite/hn-community-app-co-author-invite.entity';
import { HnCommunityAppAggregateService } from './hn-community-app-aggregate.service';

@Controller('app')
export class HnCommunityAppController extends HnAbstractFileController<HnCommunityApp> {
  constructor(
    private readonly communityAppAggregateService: HnCommunityAppAggregateService,
    fileAppService: HnFileAppService
  ) {
    super(fileAppService);
  }

  @BlPublic()
  @Get('all-map')
  async getAllAppsMap(): Promise<HnSitemapItemBase[]> {
    return this.communityAppAggregateService.getAllAppsMap();
  }

  @BlPublic()
  @Get(':id')
  async getById(@Param('id', new ParseUUIDPipe()) id: string): Promise<HnCommunityAppDto> {
    return new HnCommunityAppDto(await this.communityAppAggregateService.getAndCheckCommunityApp(id));
  }

  @BlPublic()
  @Get('app-picture/:filename')
  async getAppPicture(@Param('filename') filename: string, @Res() res: Response): Promise<any> {
    const file = await this.communityAppAggregateService.getAppPicture(filename);
    BlResponseHelper.setFileResponseAndCache(res, file);
  }

  /**
   * Get user community apps
   * @param userId
   * @param page
   * @param size
   * @returns apps
   */
  @BlPublic()
  @Get('user/:userId')
  async getUserCommunityApps(
    @Param('userId', new ParseUUIDPipe()) userId: string,
    @Query('page', new ParseIntPipe()) page: number,
    @Query('size', new ParseIntPipe()) size: number
  ): Promise<ClPage<HnCommunityAppDto>> {
    const result: ClPage<HnCommunityApp> = await this.communityAppAggregateService.findUserCommunityApps(
      userId,
      [],
      page,
      size
    );
    return result.map((communityApp) => new HnCommunityAppDto(communityApp));
  }

  @Delete(':id')
  async delete(@Param('id', new ParseUUIDPipe()) id: string): Promise<boolean> {
    return this.communityAppAggregateService.delete(id);
  }

  /**
   * Get all community apps with filters
   * @param spacesFilter
   * @param titleFilter
   * @param sortsCriteria
   * @param page
   * @param size
   */
  @BlPublic()
  @Post('filters')
  async getAll(
    @Body('spacesFilter') spacesFilter: string[],
    @Body('titleFilter') titleFilter: string,
    @Body('sortsCriteria') sortsCriteria: BlSearchSortCriteria[],
    @Query('page', new ParseIntPipe()) page: number,
    @Query('size', new ParseIntPipe()) size: number
  ): Promise<ClPage<HnCommunityAppDto>> {
    const result = await this.communityAppAggregateService.findAll(
      spacesFilter,
      titleFilter,
      sortsCriteria,
      page,
      size
    );
    return result.map((communityApp) => new HnCommunityAppDto(communityApp));
  }

  @Post()
  async create(
    @Body(new BlParsePipe(HnCommunityAppEditDto)) dto: HnCommunityAppEditDto
  ): Promise<HnCommunityAppDto> {
    return new HnCommunityAppDto(await this.communityAppAggregateService.create(dto));
  }

  @Put()
  async update(
    @Body(new BlParsePipe(HnCommunityAppEditDto)) dto: HnCommunityAppEditDto
  ): Promise<HnCommunityAppDto> {
    return new HnCommunityAppDto(await this.communityAppAggregateService.update(dto));
  }

  @Put('description/:appId')
  async updateDescription(
    @Param('appId', new ParseUUIDPipe()) appId: string,
    @Body('description') description: TeRichTextDTO
  ): Promise<HnCommunityAppDto> {
    return new HnCommunityAppDto(
      await this.communityAppAggregateService.updateDescription(appId, description)
    );
  }

  @Put('media/:appId')
  async updateMedia(
    @Param('appId', new ParseUUIDPipe()) appId: string,
    @Body('video') video: string,
    @Body('figures') figures: string[]
  ): Promise<HnCommunityAppDto> {
    return new HnCommunityAppDto(await this.communityAppAggregateService.updateMedia(appId, video, figures));
  }

  @UseInterceptors(FileInterceptor('file'))
  @Post('app-picture')
  async saveAppPicture(@BlUploadedFile() file: BlFile): Promise<any> {
    const filename = await this.communityAppAggregateService.saveAppPicture(file);
    return { filename: filename };
  }

  @Delete('app-picture/:filename')
  async deleteAppPicture(@Param('filename') filename: string): Promise<boolean> {
    return this.communityAppAggregateService.deleteAppPicture(filename);
  }

  @UseInterceptors(FileInterceptor('file'))
  @Post('file/:appId')
  async saveFile(
    @BlUploadedFile() file: BlFile,
    @Param('appId', new ParseUUIDPipe()) appId: string
  ): Promise<TeBlockFileUploadResponse> {
    return this.communityAppAggregateService.saveFile(file, appId);
  }

  @UseInterceptors(FileInterceptor('file'))
  @Post('image/:appId')
  async saveImage(
    @BlUploadedFile() file: BlFile,
    @Param('appId', new ParseUUIDPipe()) appId: string
  ): Promise<TeBlockFigureUploadedResponse> {
    return this.communityAppAggregateService.saveImage(file, appId);
  }

  @UseInterceptors(FileInterceptor('file'))
  @Post('view/:appId')
  async saveResourceViewFile(
    @BlUploadedFile() file: BlFile,
    @Param('appId', new ParseUUIDPipe()) appId: string
  ): Promise<any> {
    return this.communityAppAggregateService.saveResourceViewFile(file, appId);
  }

  ///////////////////////// CO AUTHORS //////////////////////////
  @Post('co-authors/:id/invite')
  inviteCommunityAppCoAuthor(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body('emailOrId') emailOrId: string
  ): Promise<boolean> {
    return this.communityAppAggregateService.inviteCommunityAppCoAuthor(id, emailOrId);
  }

  @BlPublic()
  @Get('co-authors/:id')
  async getCommunityAppCoAuthors(@Param('id', new ParseUUIDPipe()) id: string): Promise<HnUserDto[]> {
    return (await this.communityAppAggregateService.getCommunityAppCoAuthors(id)).map(
      (communityAppCoAuthor) => new HnUserDto(communityAppCoAuthor.user)
    );
  }

  @Get('co-authors/:id/pending-invites')
  getCommunityAppCoAuthorsPendingInvites(
    @Param('id', new ParseUUIDPipe()) id: string
  ): Promise<HnCommunityAppCoAuthorInvite[]> {
    return this.communityAppAggregateService.getCommunityAppCoAuthorsPendingInvites(id);
  }

  @Put('co-authors/:id/remove/:communityAppUserId')
  removeCommunityAppCoAuthor(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Param('communityAppUserId', new ParseUUIDPipe()) communityAppUserId: string
  ): Promise<void> {
    return this.communityAppAggregateService.removeCommunityAppCoAuthor(id, communityAppUserId);
  }

  @Get('co-authors/invite/:token/is-valid')
  isInviteValid(@Param('token') token: string): Promise<HnCommunityAppCoAuthorInvite> {
    return this.communityAppAggregateService.isInviteValid(token);
  }

  @Put('co-authors/invite/:token/accept')
  acceptInvite(@Param('token') token: string): Promise<HnCommunityApp> {
    return this.communityAppAggregateService.acceptInvite(token);
  }

  @Delete('co-authors/invite/:inviteId')
  deleteCoAuthorInvite(@Param('inviteId', new ParseUUIDPipe()) inviteId: string): Promise<boolean> {
    return this.communityAppAggregateService.deleteCoAuthorInvite(inviteId);
  }
}
