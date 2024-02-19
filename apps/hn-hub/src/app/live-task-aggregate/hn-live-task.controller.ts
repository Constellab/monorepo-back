import {Body, Controller, Get, Param, ParseIntPipe, ParseUUIDPipe, Post, Put, Query, Req} from '@nestjs/common';
import {HnLiveTaskAggregateService} from './hn-live-task-aggregate.service';
import {HnLiveTaskVersion} from './live-task-version/hn-live-task-version.entity';
import {
  HnCreateLiveTaskDto, HnLiveTaskForLabDto,
  HnLiveTaskVersionFileInput,
  HnLiveTaskVersionForLabDto
} from './live-task/hn-live-task.dto';
import {BlParsePipe, BlPublic} from '@monorepo/back-core-lib';
import {HnLiveTask} from './live-task/hn-live-task.entity';
import {ClPage} from '@monorepo/core-lib';
import {HnBrickVersion} from '../brick-aggregate/brick-version/hn-brick-version.entity';
import {IsAdmin} from '../core/decorators/hn-is-admin.decorator';

@Controller('live-task')
export class HnLiveTaskController {

  constructor(private readonly liveTaskAggregateService: HnLiveTaskAggregateService) {
  }

  //////////////////////////////////////////// Live Task ////////////////////////////////////////////

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
  @Get('public')
  async getPublicLiveTasks(): Promise<HnLiveTask[]> {
    return this.liveTaskAggregateService.findPublic();
  }

  /**
   * Get live tasks for lab
   * @param req
   */
  @BlPublic()
  @Get('available/for-lab')
  async getLiveTasksForLab(@Req() req: Request): Promise<HnLiveTaskForLabDto[]> {
    return this.liveTaskAggregateService.findForLab(req);
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
  @Post('spaces')
  getAllWithSpacesFilter(@Body('spacesFilter') spacesFilter: string[],
                         @Query('page', new ParseIntPipe()) page: number,
                         @Query('size', new ParseIntPipe()) size: number): Promise<ClPage<HnLiveTask>> {
    return this.liveTaskAggregateService.findAllWithSpacesFilter(spacesFilter, page, size);
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

  @IsAdmin()
  @Post('migrate-live-tasks')
  migrateLiveTasks(): Promise<void> {
    return this.liveTaskAggregateService.migrateLiveTasks();
  }

}
