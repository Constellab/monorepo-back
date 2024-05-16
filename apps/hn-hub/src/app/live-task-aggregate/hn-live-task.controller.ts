import {Body, Controller, Delete, Get, Param, ParseIntPipe, ParseUUIDPipe, Post, Put, Query, Req} from '@nestjs/common';
import {HnLiveTaskAggregateService} from './hn-live-task-aggregate.service';
import {HnLiveTaskVersion} from './live-task-version/hn-live-task-version.entity';
import {
  HaCreateLiveTaskVersionFromLabResponseDto,
  HnCreateLiveTaskDto,
  HnLiveTaskForLabDto,
  HnLiveTaskVersionFileInput,
  HnLiveTaskVersionForLabDto
} from './live-task/hn-live-task.dto';
import {BlParsePipe, BlPublic} from '@monorepo/back-core-lib';
import {HnLiveTask} from './live-task/hn-live-task.entity';
import {ClPage} from '@monorepo/core-lib';
import {HnBrickVersion} from '../brick-aggregate/brick-version/hn-brick-version.entity';
import {HnUser} from '../users/hn-user.entity';
import {HnLiveTaskCoAuthorInvite} from './live-task-co-author-invite/hn-live-task-co-author-invite.entity';
import {HnSitemapItemBase} from '../core/model/config/hn-site-map.class';

@Controller('live-task')
export class HnLiveTaskController {

  constructor(private readonly liveTaskAggregateService: HnLiveTaskAggregateService) {
  }

  //////////////////////////////////////////// Live Task ////////////////////////////////////////////

  @BlPublic()
  @Get('all-map')
  async getAllLiveTasksMap(): Promise<HnSitemapItemBase[]> {
    return this.liveTaskAggregateService.getAllLiveTasksMap();
  }

  /**
   * Create a live task
   * @body createLiveTaskDto
   * @return the created live task version
   */
  @Post()
  create(@Body(new BlParsePipe(HnCreateLiveTaskDto)) createLiveTaskDto: HnCreateLiveTaskDto): Promise<HnLiveTaskVersion> {
    return this.liveTaskAggregateService.create(createLiveTaskDto);
  }

  @BlPublic()
  @Post('/for-lab')
  async createForLab(@Body(new BlParsePipe(HnCreateLiveTaskDto)) createLiveTaskDto: HnCreateLiveTaskDto,
                     @Req() req: Request): Promise<HaCreateLiveTaskVersionFromLabResponseDto> {
    return this.liveTaskAggregateService.createForLab(createLiveTaskDto, req);
  }

  @BlPublic()
  @Post('/for-lab/fork/:id')
  async forkForLab(@Param('id') liveTaskVersionId: string,
                   @Body(new BlParsePipe(HnCreateLiveTaskDto)) createLiveTaskDto: HnCreateLiveTaskDto,
                   @Req() req: Request): Promise<HaCreateLiveTaskVersionFromLabResponseDto> {
    return this.liveTaskAggregateService.forkForLab(liveTaskVersionId, createLiveTaskDto, req);
  }

  @BlPublic()
  @Post('/for-lab/version/:id')
  async createNewVersionForLab(@Param('id', ParseUUIDPipe) liveTaskId: string,
                               @Body('versionFile') versionFile: HnLiveTaskVersionFileInput,
                               @Req() req: Request): Promise<HaCreateLiveTaskVersionFromLabResponseDto> {
    return this.liveTaskAggregateService.createNewVersionForLab(liveTaskId, versionFile, req);
  }

  @BlPublic()
  @Get('public')
  async getPublicLiveTasks(): Promise<HnLiveTask[]> {
    return this.liveTaskAggregateService.findPublic();
  }

  /**
   * Get live tasks for lab
   * @param req
   * @param spacesFilter
   * @param titleFilter
   * @param personalOnly
   * @param page
   * @param size
   * @return live tasks
   */
  @BlPublic()
  @Post('available/for-lab')
  async getLiveTasksForLab(@Req() req: Request,
                           @Body('spacesFilter') spacesFilter: string[],
                           @Body('titleFilter') titleFilter: string,
                           @Body('personalOnly') personalOnly: boolean,
                           @Query('page', new ParseIntPipe()) page: number,
                           @Query('size', new ParseIntPipe()) size: number): Promise<ClPage<HnLiveTaskForLabDto>> {
    return this.liveTaskAggregateService.getLiveTasksForLab(req, spacesFilter, titleFilter, personalOnly, page, size);
  }

  @BlPublic()
  @Get('for-lab/version/:id')
  async getLiveTaskVersionForLab(@Req() req: Request,
                                 @Param('id', ParseUUIDPipe) versionId: string): Promise<HnLiveTaskForLabDto> {
    return this.liveTaskAggregateService.getLiveTaskForLabByVersionId(req, versionId);
  }

  /**
   * Get live tasks
   * @return live tasks
   */
  @BlPublic()
  @Get()
  async getAll(@Query('page', new ParseIntPipe()) page: number,
               @Query('size', new ParseIntPipe()) size: number): Promise<ClPage<HnLiveTask>> {
    return this.liveTaskAggregateService.findAll(page, size);
  }

  /**
   * Get live tasks with spaces filter
   * @body spacesFilter
   * @return live tasks
   */
  @BlPublic()
  @Post('filters')
  getAllWithSpacesFilter(@Body('spacesFilter') spacesFilter: string[],
                         @Body('titleFilter') titleFilter: string,
                         @Query('page', new ParseIntPipe()) page: number,
                         @Query('size', new ParseIntPipe()) size: number): Promise<ClPage<HnLiveTask>> {
    return this.liveTaskAggregateService.findAllWithFilters(spacesFilter, titleFilter, page, size);
  }


  /**
   * Get a live task by id
   * @param id
   * @return a live task
   */
  @BlPublic()
  @Get(':id')
  getLiveTaskById(@Param('id', ParseUUIDPipe) id: string): Promise<HnLiveTask> {
    return this.liveTaskAggregateService.findLiveTaskById(id);
  }

  /**
   * Get a live task title by id
   * @param id
   * @return the live task title
   */
  @BlPublic()
  @Get(':id/title')
  getLiveTaskTitleById(@Param('id', ParseUUIDPipe) id: string): Promise<string> {
    return this.liveTaskAggregateService.findLiveTaskTitleById(id);
  }

  @Put(':id/title')
  updateTitle(@Param('id', ParseUUIDPipe) id: string, @Body('title') title: string): Promise<HnLiveTask> {
    return this.liveTaskAggregateService.updateTitle(id, title);
  }

  /**
   * Update a live task description
   * @param id
   * @param description
   * @return the updated live task
   */
  @Put('description/:id')
  updateDescription(@Param('id', ParseUUIDPipe) id: string, @Body() description: Record<string, any>): Promise<HnLiveTask> {
    return this.liveTaskAggregateService.updateDescription(id, description);
  }

  /**
   * Get live task brick dependencies (last live task version)
   * @param id
   * @return a list of brick versions
   */
  @BlPublic()
  @Get(':id/brick-dependencies')
  getBrickDependencies(@Param('id', ParseUUIDPipe) id: string): Promise<HnBrickVersion[]> {
    return this.liveTaskAggregateService.getBrickDependencies(id);
  }


  //////////////////////////////////////////// Live Task Version ////////////////////////////////////////////

  /**
   * Get a live task version by id
   * @param id
   * @return a live task version
   */
  @BlPublic()
  @Get('version/:id')
  getLiveTaskVersionById(@Param('id', ParseUUIDPipe) id: string): Promise<HnLiveTaskVersion> {
    return this.liveTaskAggregateService.findLiveTaskVersionById(id);
  }

  /**
   * Get latest published live task version by live task id
   * @param liveTaskId
   * @return a live task version code
   */
  @BlPublic()
  @Get(':liveTaskId/version/latest')
  getLatestPublishedLiveTaskVersionByLiveTaskId(@Param('liveTaskId', ParseUUIDPipe) liveTaskId: string): Promise<HnLiveTaskVersion> {
    return this.liveTaskAggregateService.findLatestPublishedLiveTaskVersionByLiveTaskId(liveTaskId);
  }

  /**
   * Get latest published live task version by live task id for lab
   * @param liveTaskId
   * @param req
   * @return a live task version code
   */
  @BlPublic()
  @Get(':liveTaskId/version/latest/for-lab')
  getLatestPublishedLiveTaskVersionForLabByLiveTaskId(@Param('liveTaskId', ParseUUIDPipe) liveTaskId: string,
                                                      @Req() req: Request): Promise<HnLiveTaskVersionForLabDto> {
    return this.liveTaskAggregateService.findLatestPublishedLiveTaskVersionForLabByLiveTaskId(liveTaskId, req);
  }

  @BlPublic()
  @Get(':liveTaskId/version/:versionNumber')
  getLiveTaskVersionByLiveTaskIdAndVersionNumber(@Param('liveTaskId', ParseUUIDPipe) liveTaskId: string,
                                                 @Param('versionNumber') versionNumber: string): Promise<HnLiveTaskVersion> {
    return this.liveTaskAggregateService.findLiveTaskVersionByLiveTaskIdAndVersionNumber(liveTaskId, +versionNumber);
  }

  /**
   * Update a live task version params
   * @param id
   * @param params
   * @return the updated live task version
   */
  @Put('version/:id/params')
  updateLiveTaskVersionParams(@Param('id', ParseUUIDPipe) id: string, @Body('params') params: string[]): Promise<HnLiveTaskVersion> {
    return this.liveTaskAggregateService.updateLiveTaskVersionParams(id, params);
  }

  /**
   * Update a live task version code
   * @param id
   * @param code
   * @return the updated live task version
   */
  @Put('version/:id/code')
  updateLiveTaskVersionCode(@Param('id', ParseUUIDPipe) id: string, @Body('code') code: string): Promise<HnLiveTaskVersion> {
    return this.liveTaskAggregateService.updateLiveTaskVersionCode(id, code);
  }

  /**
   * Update a live task version environment
   * @param id
   * @param environment
   * @return the updated live task version
   */
  @Put('version/:id/environment')
  updateLiveTaskVersionEnvironment(@Param('id', ParseUUIDPipe) id: string,
                                   @Body('environment') environment: string): Promise<HnLiveTaskVersion> {
    return this.liveTaskAggregateService.updateLiveTaskVersionEnvironment(id, environment);
  }

  /**
   * Publish a live task version
   * @param id
   * @return the published live task version
   */
  @Put('version/:id/publish')
  publishLiveTaskVersion(@Param('id', ParseUUIDPipe) id: string): Promise<HnLiveTaskVersion> {
    return this.liveTaskAggregateService.publishLiveTaskVersion(id);
  }

  /**
   * Get all published live task versions by live task id
   * @param liveTaskId
   * @return a list of live task versions
   */
  @BlPublic()
  @Get(':liveTaskId/versions/published')
  getPublishedLiveTaskVersions(@Param('liveTaskId', ParseUUIDPipe) liveTaskId: string): Promise<HnLiveTaskVersion[]> {
    return this.liveTaskAggregateService.getPublishedLiveTaskVersions(liveTaskId);
  }

  /**
   * Create a new draft version of a live task
   * @param liveTaskId
   * @param newLiveTaskVersionFile
   * @return the created live task version
   */
  @Put(':liveTaskId/version/draft')
  createNewDraftVersion(@Param('liveTaskId', ParseUUIDPipe) liveTaskId: string,
                        // eslint-disable-next-line max-len
                        @Body(new BlParsePipe(HnLiveTaskVersionFileInput)) newLiveTaskVersionFile: HnLiveTaskVersionFileInput): Promise<HnLiveTaskVersion> {
    return this.liveTaskAggregateService.createNewDraftVersion(liveTaskId, newLiveTaskVersionFile);
  }

  /**
   * Update a live task version infos
   * @param versionId
   * @param infos
   * @return the updated live task version
   */
  @Put('version/:versionId/infos')
  updateLiveTaskVersionInfos(@Param('versionId', ParseUUIDPipe) versionId: string,
                             @Body() infos: Record<string, any>): Promise<HnLiveTaskVersion> {
    return this.liveTaskAggregateService.updateLiveTaskVersionInfos(versionId, infos);
  }

  /**
   * Get live task version brick dependencies
   * @param liveTaskVersionId
   * @return a list of brick versions
   */
  @BlPublic()
  @Get('version/:liveTaskVersionId/brick-dependencies')
  getLiveTaskVersionBrickDependencies(@Param('liveTaskVersionId', ParseUUIDPipe) liveTaskVersionId: string): Promise<HnBrickVersion[]> {
    return this.liveTaskAggregateService.getLiveTaskVersionBrickDependencies(liveTaskVersionId);
  }

  @Delete(':id')
  deleteLiveTask(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    return this.liveTaskAggregateService.deleteLiveTask(id);
  }

  ////////////////////////////////////////// CO AUTHORS //////////////////////////////////////////
  @Post(':id/invite-co-author')
  async inviteLiveTaskCoAuthor(@Param('id', new ParseUUIDPipe()) id: string,
                               @Body('coAuthorMail') coAuthorMail: string): Promise<boolean> {
    return this.liveTaskAggregateService.inviteLiveTaskCoAuthor(id, coAuthorMail);
  }

  @BlPublic()
  @Get(':id/co-authors')
  async getLiveTaskCoAuthors(@Param('id', new ParseUUIDPipe()) id: string): Promise<HnUser[]> {
    return this.liveTaskAggregateService.getLiveTaskCoAuthors(id);
  }

  @Get(':id/co-authors-pending-invites')
  async getLiveTaskCoAuthorsPendingInvites(@Param('id', new ParseUUIDPipe()) id: string): Promise<HnLiveTaskCoAuthorInvite[]> {
    return this.liveTaskAggregateService.getLiveTaskCoAuthorsPendingInvites(id);
  }

  /***
   * Remove liveTask co-author
   */
  @Put(':id/remove-co-author/:liveTaskAuthorUserId')
  async removeLiveTaskCoAuthor(@Param('id', new ParseUUIDPipe()) id: string,
                               @Param('liveTaskAuthorUserId', new ParseUUIDPipe()) liveTaskAuthorUserId: string): Promise<void> {
    return this.liveTaskAggregateService.removeLiveTaskCoAuthor(id, liveTaskAuthorUserId);
  }


  /***
   * Is invite valid
   */
  @Get('invite/:token/is-valid')
  isInviteValid(@Param('token') token: string): Promise<HnLiveTaskCoAuthorInvite> {
    return this.liveTaskAggregateService.isInviteValid(token);
  }

  /***
   * Accept invite
   */
  @Put('invite/:token/accept')
  acceptInvite(@Param('token') token: string): Promise<HnLiveTask> {
    return this.liveTaskAggregateService.acceptInvite(token);
  }

  @Delete('invite/:inviteId')
  async deleteCoAuthorInvite(@Param('inviteId', new ParseUUIDPipe()) inviteId: string): Promise<boolean> {
    return this.liveTaskAggregateService.deleteCoAuthorInvite(inviteId);
  }

}
