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
  UseInterceptors,
} from '@nestjs/common';
import { HnAgentAggregateService } from './hn-agent-aggregate.service';
import { HnAgentVersion } from './agent-version/hn-agent-version.entity';
import {
  HaCreateAgentVersionFromLabResponseDto,
  HnAgentDto,
  HnAgentEditStyleData,
  HnAgentForLabDto,
  HnAgentVersionFileInput,
  HnAgentVersionForLabDto,
  HnCreateAgentDto,
} from './agent/hn-agent.dto';
import {
  BlFile,
  BlParsePipe,
  BlPublic,
  BlRichTextUploadedImageResponse,
  BlRichTextUploadFileResponse,
  BlUploadedFile,
} from '@monorepo/back-core-lib';
import { HnAgent } from './agent/hn-agent.entity';
import { ClPage } from '@monorepo/core-lib';
import { HnAgentCoAuthorInvite } from './agent-co-author-invite/hn-agent-co-author-invite.entity';
import { HnSitemapItemBase } from '../core/model/config/hn-site-map.class';
import { HnBrickVersionDto } from '../brick-aggregate/brick-version/hn-brick-version.dto';
import { HnAgentVersionDto } from './agent-version/hn-agent-version.dto';
import { HnUserDto } from '../users/hn-user.dto';
import { HnAbstractFileController } from '../file-aggregate/file-core/hn-abstract-file.controller';
import { HnFileAgentService } from '../file-aggregate/file-agent/hn-file-agent.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { HnAgentVersionMigrator } from './agent-version/hn-agent-version-migrator.class';
import { HnLabGuard } from '../core/decorators/hn-lab-auth-guard.decorator';
import { IsAdmin } from '../core/decorators/hn-is-admin.decorator';

@Controller('agent')
export class HnAgentController extends HnAbstractFileController<HnAgent> {
  constructor(
    private readonly agentAggregateService: HnAgentAggregateService,
    private readonly agentFileService: HnFileAgentService
  ) {
    super(agentFileService);
  }

  // TODO: TO REMOVE
  @IsAdmin()
  @Get('migrate-style')
  async migrateStyle(): Promise<void> {
    return this.agentAggregateService.migrateStyle();
  }

  //////////////////////////////////////////// Agent ////////////////////////////////////////////

  @BlPublic()
  @Get('all-map')
  async getAllAgentsMap(): Promise<HnSitemapItemBase[]> {
    return this.agentAggregateService.getAllAgentsMap();
  }

  /**
   * Create an agent
   * @body createAgentDto
   * @return the created agent version
   */
  @Post()
  create(@Body(new BlParsePipe(HnCreateAgentDto)) createAgentDto: HnCreateAgentDto): Promise<HnAgentVersion> {
    const migrator: HnAgentVersionMigrator = new HnAgentVersionMigrator();
    createAgentDto.versionFile = migrator.migrateAgentVersionFile(createAgentDto.versionFile);
    return this.agentAggregateService.create(createAgentDto);
  }

  @BlPublic()
  @HnLabGuard()
  @Post('/for-lab')
  async createForLab(
    @Body(new BlParsePipe(HnCreateAgentDto)) createAgentDto: HnCreateAgentDto
  ): Promise<HaCreateAgentVersionFromLabResponseDto> {
    const migrator: HnAgentVersionMigrator = new HnAgentVersionMigrator();
    createAgentDto.versionFile = migrator.migrateAgentVersionFile(createAgentDto.versionFile);
    return this.agentAggregateService.createForLab(createAgentDto);
  }

  @BlPublic()
  @HnLabGuard()
  @Post('/for-lab/fork/:id')
  async forkForLab(
    @Param('id') agentVersionId: string,
    @Body(new BlParsePipe(HnCreateAgentDto)) createAgentDto: HnCreateAgentDto
  ): Promise<HaCreateAgentVersionFromLabResponseDto> {
    const migrator: HnAgentVersionMigrator = new HnAgentVersionMigrator();
    createAgentDto.versionFile = migrator.migrateAgentVersionFile(createAgentDto.versionFile);
    return this.agentAggregateService.forkForLab(agentVersionId, createAgentDto);
  }

  @BlPublic()
  @HnLabGuard()
  @Post('/for-lab/version/:id')
  async createNewVersionForLab(
    @Param('id', ParseUUIDPipe) agentId: string,
    @Body('versionFile') versionFile: HnAgentVersionFileInput
  ): Promise<HaCreateAgentVersionFromLabResponseDto> {
    const migrator: HnAgentVersionMigrator = new HnAgentVersionMigrator();
    versionFile = migrator.migrateAgentVersionFile(versionFile);
    return this.agentAggregateService.createNewVersionForLab(agentId, versionFile);
  }

  @BlPublic()
  @Get('public')
  async getPublicAgents(): Promise<HnAgentDto[]> {
    return this.agentAggregateService.findPublic();
  }

  /**
   * Get agents for lab
   * @param spacesFilter
   * @param titleFilter
   * @param personalOnly
   * @param page
   * @param size
   * @return agents
   */
  @BlPublic()
  @HnLabGuard()
  @Post('available/for-lab')
  async getAgentsForLab(
    @Body('spacesFilter') spacesFilter: string[],
    @Body('titleFilter') titleFilter: string,
    @Body('personalOnly') personalOnly: boolean,
    @Query('page', new ParseIntPipe()) page: number,
    @Query('size', new ParseIntPipe()) size: number
  ): Promise<ClPage<HnAgentForLabDto>> {
    return this.agentAggregateService.getAgentsForLab(spacesFilter, titleFilter, personalOnly, page, size);
  }

  @BlPublic()
  @HnLabGuard()
  @Get('for-lab/version/:id/:jsonVersionNumber?')
  async getAgentVersionForLab(
    @Param('id', ParseUUIDPipe) versionId: string,
    @Param('jsonVersionNumber') jsonVersionNumber?: string
  ): Promise<HnAgentForLabDto> {
    let versionNumber = null;
    if (!jsonVersionNumber) {
      versionNumber = 1;
    } else {
      versionNumber = +jsonVersionNumber;
    }
    return this.agentAggregateService.getAgentForLabByVersionId(versionId, versionNumber);
  }

  /**
   * Get agents
   * @return agents
   */
  @BlPublic()
  @Get()
  async getAll(
    @Query('page', new ParseIntPipe()) page: number,
    @Query('size', new ParseIntPipe()) size: number
  ): Promise<ClPage<HnAgentDto>> {
    return this.agentAggregateService.findAll(page, size);
  }

  /**
   * Get agents with spaces filter
   * @body spacesFilter
   * @return agents
   */
  @BlPublic()
  @Post('filters')
  getAllWithSpacesFilter(
    @Body('spacesFilter') spacesFilter: string[],
    @Body('titleFilter') titleFilter: string,
    @Query('page', new ParseIntPipe()) page: number,
    @Query('size', new ParseIntPipe()) size: number
  ): Promise<ClPage<HnAgentDto>> {
    return this.agentAggregateService.findAllWithFilters(spacesFilter, titleFilter, page, size);
  }

  /**
   * Get user agents
   * @param userId
   * @param page
   * @param size
   * @return agents
   */
  @BlPublic()
  @Get('user/:userId')
  getUserAgents(
    @Param('userId', ParseUUIDPipe) userId: string,
    @Query('page', new ParseIntPipe()) page: number,
    @Query('size', new ParseIntPipe()) size: number
  ): Promise<ClPage<HnAgentDto>> {
    return this.agentAggregateService.findUserAgents(userId, page, size);
  }

  /**
   * Get an agent by id
   * @param id
   * @return an agent
   */
  @BlPublic()
  @Get(':id')
  async getAgentById(@Param('id', ParseUUIDPipe) id: string): Promise<HnAgentDto> {
    return new HnAgentDto(await this.agentAggregateService.findAgentById(id));
  }

  @Put(':id/title')
  updateTitle(@Param('id', ParseUUIDPipe) id: string, @Body('title') title: string): Promise<HnAgent> {
    return this.agentAggregateService.updateTitle(id, title);
  }

  /**
   * Update an agent description
   * @param id
   * @param description
   * @return the updated agent
   */
  @Put(':id/description')
  updateDescription(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() description: Record<string, any>
  ): Promise<HnAgent> {
    return this.agentAggregateService.updateDescription(id, description);
  }

  @Put(':id/style')
  updateStyle(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() data: HnAgentEditStyleData
  ): Promise<HnAgentDto> {
    return this.agentAggregateService.updateStyle(id, data);
  }

  @Delete(':id')
  deleteAgent(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    return this.agentAggregateService.deleteAgent(id);
  }

  //////////////////////////////////////////// Agent Version ////////////////////////////////////////////

  /**
   * Get an agent version by id
   * @param id
   * @return an agent version
   */
  @BlPublic()
  @Get('version/:id')
  getAgentVersionById(@Param('id', ParseUUIDPipe) id: string): Promise<HnAgentVersionDto> {
    return this.agentAggregateService.findAgentVersionById(id);
  }

  /**
   * Get latest published agent version by agent id
   * @param agentId
   * @return an agent version code
   */
  @BlPublic()
  @Get(':agentId/version/latest')
  getLatestPublishedAgentVersionByAgentId(
    @Param('agentId', ParseUUIDPipe) agentId: string
  ): Promise<HnAgentVersionDto> {
    return this.agentAggregateService.findLatestPublishedAgentVersionByAgentId(agentId);
  }

  /**
   * Get latest published agent version by agent id for lab
   * @param agentId
   * @param jsonVersionNumber
   * @return an agent version code
   */
  @BlPublic()
  @HnLabGuard()
  @Get(':agentId/version/latest/for-lab/:jsonVersionNumber?')
  async getLatestPublishedAgentVersionForLabByAgentId(
    @Param('agentId', ParseUUIDPipe) agentId: string,
    @Param('jsonVersionNumber') jsonVersionNumber?: string
  ): Promise<HnAgentVersionForLabDto> {
    let versionNumber = null;
    if (!jsonVersionNumber) {
      versionNumber = 1;
    } else {
      versionNumber = +jsonVersionNumber;
    }
    return await this.agentAggregateService.findLatestPublishedAgentVersionForLabByAgentId(
      agentId,
      versionNumber
    );
  }

  @BlPublic()
  @Get(':agentId/version/:versionNumber')
  getAgentVersionByAgentIdAndVersionNumber(
    @Param('agentId', ParseUUIDPipe) agentId: string,
    @Param('versionNumber') versionNumber: string
  ): Promise<HnAgentVersionDto> {
    return this.agentAggregateService.findAgentVersionByAgentIdAndVersionNumber(agentId, +versionNumber);
  }

  /**
   * Update an agent version params
   * @param id
   * @param params
   * @return the updated agent version
   */
  @Put('version/:id/params')
  updateAgentVersionParams(
    @Param('id', ParseUUIDPipe) id: string,
    @Body('params') params: string
  ): Promise<HnAgentVersion> {
    return this.agentAggregateService.updateAgentVersionParams(id, params);
  }

  /**
   * Update an agent version code
   * @param id
   * @param code
   * @return the updated agent version
   */
  @Put('version/:id/code')
  updateAgentVersionCode(
    @Param('id', ParseUUIDPipe) id: string,
    @Body('code') code: string
  ): Promise<HnAgentVersion> {
    return this.agentAggregateService.updateAgentVersionCode(id, code);
  }

  /**
   * Update an agent version environment
   * @param id
   * @param environment
   * @return the updated agent version
   */
  @Put('version/:id/environment')
  updateAgentVersionEnvironment(
    @Param('id', ParseUUIDPipe) id: string,
    @Body('environment') environment: string
  ): Promise<HnAgentVersion> {
    return this.agentAggregateService.updateAgentVersionEnvironment(id, environment);
  }

  /**
   * Publish an agent version
   * @param id
   * @return the published agent version
   */
  @Put('version/:id/publish')
  publishAgentVersion(@Param('id', ParseUUIDPipe) id: string): Promise<HnAgentVersion> {
    return this.agentAggregateService.publishAgentVersion(id);
  }

  /**
   * Get all published agent versions by agent id
   * @param agentId
   * @return a list of agent versions
   */
  @BlPublic()
  @Get(':agentId/versions/published')
  getPublishedAgentVersions(@Param('agentId', ParseUUIDPipe) agentId: string): Promise<HnAgentVersionDto[]> {
    return this.agentAggregateService.getPublishedAgentVersions(agentId);
  }

  /**
   * Create a new draft version of an agent
   * @param agentId
   * @param newAgentVersionFile
   * @return the created agent version
   */
  @Put(':agentId/version/draft')
  createNewDraftVersion(
    @Param('agentId', ParseUUIDPipe) agentId: string,
    // eslint-disable-next-line max-len
    @Body(new BlParsePipe(HnAgentVersionFileInput)) newAgentVersionFile: HnAgentVersionFileInput
  ): Promise<HnAgentVersion> {
    const migrator: HnAgentVersionMigrator = new HnAgentVersionMigrator();
    newAgentVersionFile = migrator.migrateAgentVersionFile(newAgentVersionFile);
    return this.agentAggregateService.createNewDraftVersion(agentId, newAgentVersionFile);
  }

  /**
   * Replace the current draft version by a new one
   * @param agentId
   * @param newAgentVersionFile
   * @return the created agent version
   */
  @Put(':agentId/version/draft/replace')
  replaceDraftVersion(
    @Param('agentId', ParseUUIDPipe) agentId: string,
    // eslint-disable-next-line max-len
    @Body(new BlParsePipe(HnAgentVersionFileInput)) newAgentVersionFile: HnAgentVersionFileInput
  ): Promise<HnAgentVersion> {
    const migrator: HnAgentVersionMigrator = new HnAgentVersionMigrator();
    newAgentVersionFile = migrator.migrateAgentVersionFile(newAgentVersionFile);
    return this.agentAggregateService.replaceDraftVersion(agentId, newAgentVersionFile);
  }

  /**
   * Update an agent version infos
   * @param versionId
   * @param infos
   * @return the updated agent version
   */
  @Put('version/:versionId/infos')
  updateAgentVersionInfos(
    @Param('versionId', ParseUUIDPipe) versionId: string,
    @Body() infos: Record<string, any>
  ): Promise<HnAgentVersion> {
    return this.agentAggregateService.updateAgentVersionInfos(versionId, infos);
  }

  /**
   * Get agent version brick dependencies
   * @param agentVersionId
   * @return a list of brick versions
   */
  @BlPublic()
  @Get('version/:agentVersionId/brick-dependencies')
  getAgentVersionBrickDependencies(
    @Param('agentVersionId', ParseUUIDPipe) agentVersionId: string
  ): Promise<HnBrickVersionDto[]> {
    return this.agentAggregateService.getAgentVersionBrickDependencies(agentVersionId);
  }

  @Put('version/:versionId/style')
  updateVersionStyle(
    @Param('versionId', ParseUUIDPipe) versionId: string,
    @Body() data: HnAgentEditStyleData
  ): Promise<HnAgentVersionDto> {
    return this.agentAggregateService.updateVersionStyle(versionId, data);
  }

  ////////////////////////////////////////// CO AUTHORS //////////////////////////////////////////
  @Post('co-authors/:id/invite')
  async inviteAgentCoAuthor(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body('coAuthorMail') coAuthorMail: string
  ): Promise<boolean> {
    return this.agentAggregateService.inviteAgentCoAuthor(id, coAuthorMail);
  }

  @BlPublic()
  @Get('co-authors/:id')
  async getAgentCoAuthors(@Param('id', new ParseUUIDPipe()) id: string): Promise<HnUserDto[]> {
    return this.agentAggregateService.getAgentCoAuthors(id);
  }

  @Get('co-authors/:id/pending-invites')
  async getAgentCoAuthorsPendingInvites(
    @Param('id', new ParseUUIDPipe()) id: string
  ): Promise<HnAgentCoAuthorInvite[]> {
    return this.agentAggregateService.getAgentCoAuthorsPendingInvites(id);
  }

  /***
   * Remove agent co-author
   */
  @Put('co-authors/:id/remove/:agentAuthorUserId')
  async removeAgentCoAuthor(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Param('agentAuthorUserId', new ParseUUIDPipe()) agentAuthorUserId: string
  ): Promise<void> {
    return this.agentAggregateService.removeAgentCoAuthor(id, agentAuthorUserId);
  }

  /***
   * Is invite valid
   */
  @Get('co-authors/invite/:token/is-valid')
  isInviteValid(@Param('token') token: string): Promise<HnAgentCoAuthorInvite> {
    return this.agentAggregateService.isInviteValid(token);
  }

  /***
   * Accept invite
   */
  @Put('co-authors/invite/:token/accept')
  acceptInvite(@Param('token') token: string): Promise<HnAgent> {
    return this.agentAggregateService.acceptInvite(token);
  }

  @Delete('co-authors/invite/:inviteId')
  async deleteCoAuthorInvite(@Param('inviteId', new ParseUUIDPipe()) inviteId: string): Promise<boolean> {
    return this.agentAggregateService.deleteCoAuthorInvite(inviteId);
  }

  //////////////////////////////////////////// FILE ////////////////////////////////////////////

  @UseInterceptors(FileInterceptor('file'))
  @Post('file/:agentId')
  async saveFile(
    @BlUploadedFile() file: BlFile,
    @Param('agentId', new ParseUUIDPipe()) agentId: string
  ): Promise<BlRichTextUploadFileResponse> {
    return this.agentAggregateService.saveFile(file, agentId);
  }

  @UseInterceptors(FileInterceptor('file'))
  @Post('image/:agentId')
  async saveImage(
    @BlUploadedFile() file: BlFile,
    @Param('agentId', new ParseUUIDPipe()) agentId: string
  ): Promise<BlRichTextUploadedImageResponse> {
    return this.agentAggregateService.saveImage(file, agentId);
  }

  @UseInterceptors(FileInterceptor('file'))
  @Post(':agentId/view')
  async saveResourceViewFile(
    @BlUploadedFile() file: BlFile,
    @Param('agentId', new ParseUUIDPipe()) agentId: string
  ): Promise<any> {
    return {
      filename: await this.agentAggregateService.saveView(file, agentId),
    };
  }

  @Delete('version/:agentVersionId')
  async deleteAgentVersion(
    @Param('agentVersionId', new ParseUUIDPipe()) agentVersionId: string
  ): Promise<void> {
    return this.agentAggregateService.deleteAgentVersion(agentVersionId);
  }
}
