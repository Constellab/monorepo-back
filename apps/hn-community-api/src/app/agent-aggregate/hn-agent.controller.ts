import { BlFile, BlParsePipe, BlPublic, BlSearchSortCriteria, BlUploadedFile } from '@monorepo/back-core-lib';
import { ClPage } from '@monorepo/core-lib';
import {
  TeBlockFigureUploadedResponse,
  TeBlockFileUploadResponse,
  TeRichText,
  TeRichTextPipe,
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

import { HnBrickVersionDto } from '../brick-aggregate/brick-version/hn-brick-version.dto';
import { HnLabGuard } from '../core/decorators/hn-lab-auth-guard.decorator';
import { HnSitemapItemBase } from '../core/model/config/hn-site-map.class';
import { HnFileAgentService } from '../file-aggregate/file-agent/hn-file-agent.service';
import { HnAbstractFileController } from '../file-aggregate/file-core/hn-abstract-file.controller';
import { HnUserDto } from '../users/hn-user.dto';
import {
  HnAgentDto,
  HnAgentEditStyleData,
  HnAgentForLabDto,
  HnAgentVersionFileInput,
  HnCreateAgentDto,
} from './agent/hn-agent.dto';
import { HnAgent } from './agent/hn-agent.entity';
import { HnAgentCoAuthorInvite } from './agent-co-author-invite/hn-agent-co-author-invite.entity';
import { HnAgentVersionDto } from './agent-version/hn-agent-version.dto';
import { HnAgentVersion } from './agent-version/hn-agent-version.entity';
import { HnAgentVersionMigrator } from './agent-version/hn-agent-version-migrator.class';
import { HnAgentAggregateService } from './hn-agent-aggregate.service';
import { HnAgentForLabController } from './hn-agent-for-lab.controller';

@Controller('agent')
export class HnAgentController extends HnAbstractFileController<HnAgent> {
  constructor(
    private readonly agentAggregateService: HnAgentAggregateService,
    private readonly agentForLabController: HnAgentForLabController,
    readonly agentFileService: HnFileAgentService
  ) {
    super(agentFileService);
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
  @Get('public')
  async getPublicAgents(): Promise<HnAgentDto[]> {
    return (await this.agentAggregateService.findPublic()).map((agent) => new HnAgentDto(agent));
  }

  // TODO: TO REMOVE
  /**
   * Get agents for lab
   * @param spacesFilter
   * @param titleFilter
   * @param personalOnly
   * @param page
   * @param size
   * @return agents
   */
  @HnLabGuard()
  @Post('available/for-lab')
  async getAgentsForLab(
    @Body('spacesFilter') spacesFilter: string[],
    @Body('titleFilter') titleFilter: string,
    @Body('personalOnly') personalOnly: boolean,
    @Query('page', new ParseIntPipe()) page: number,
    @Query('size', new ParseIntPipe()) size: number
  ): Promise<ClPage<HnAgentForLabDto>> {
    return this.agentForLabController.getAgentsForLab(spacesFilter, titleFilter, personalOnly, page, size);
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
    @Body('sorts') sortsCriteria: BlSearchSortCriteria[],
    @Query('page', new ParseIntPipe()) page: number,
    @Query('size', new ParseIntPipe()) size: number
  ): Promise<ClPage<HnAgentDto>> {
    return this.agentAggregateService.findAllWithFilters(
      spacesFilter,
      titleFilter,
      sortsCriteria,
      page,
      size
    );
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
    @Body(TeRichTextPipe) description: TeRichText
  ): Promise<HnAgent> {
    return this.agentAggregateService.updateDescription(id, description);
  }

  @Put(':id/space')
  async updateSpace(
    @Param('id', ParseUUIDPipe) id: string,
    @Body('spaceId') spaceId: string
  ): Promise<HnAgentDto> {
    return new HnAgentDto(await this.agentAggregateService.updateSpace(id, spaceId));
  }

  @Put(':id/style')
  async updateStyle(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() data: HnAgentEditStyleData
  ): Promise<HnAgentDto> {
    return new HnAgentDto(await this.agentAggregateService.updateStyle(id, data));
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
  async getAgentVersionById(@Param('id', ParseUUIDPipe) id: string): Promise<HnAgentVersionDto> {
    return new HnAgentVersionDto(await this.agentAggregateService.findAgentVersionById(id));
  }

  /**
   * Get latest published agent version by agent id
   * @param agentId
   * @return an agent version code
   */
  @BlPublic()
  @Get(':agentId/version/latest')
  async getLatestPublishedAgentVersionByAgentId(
    @Param('agentId', ParseUUIDPipe) agentId: string
  ): Promise<HnAgentVersionDto> {
    return new HnAgentVersionDto(
      await this.agentAggregateService.findLatestPublishedAgentVersionByAgentId(agentId)
    );
  }

  /**
   * Get latest published agent version by agent id for lab
   * @param res
   * @param agentId
   * @param jsonVersionNumber
   * @return an agent version code
   */
  @BlPublic()
  @HnLabGuard()
  @Get([':agentId/version/latest/for-lab/:jsonVersionNumber', ':agentId/version/latest/for-lab'])
  getLatestPublishedAgentVersionForLabByAgentId(
    @Res() res: Response,
    @Param('agentId', ParseUUIDPipe) agentId: string,
    @Param('jsonVersionNumber') jsonVersionNumber?: string
  ): void {
    const basePath = `/agent/for-lab/${agentId}/version/latest`;
    return res.redirect(jsonVersionNumber ? `${basePath}/${jsonVersionNumber}` : basePath);
  }

  @BlPublic()
  @Get(':agentId/version/:versionNumber')
  async getAgentVersionByAgentIdAndVersionNumber(
    @Param('agentId', ParseUUIDPipe) agentId: string,
    @Param('versionNumber') versionNumber: string
  ): Promise<HnAgentVersionDto> {
    return new HnAgentVersionDto(
      await this.agentAggregateService.findAgentVersionByAgentIdAndVersionNumber(agentId, +versionNumber)
    );
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
    @Body('params') params: Record<string, any>
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
  async getPublishedAgentVersions(
    @Param('agentId', ParseUUIDPipe) agentId: string
  ): Promise<HnAgentVersionDto[]> {
    return (await this.agentAggregateService.getPublishedAgentVersions(agentId)).map(
      (agentVersion) => new HnAgentVersionDto(agentVersion)
    );
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
    @Body(TeRichTextPipe) infos: TeRichText
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
  async getAgentVersionBrickDependencies(
    @Param('agentVersionId', ParseUUIDPipe) agentVersionId: string
  ): Promise<HnBrickVersionDto[]> {
    return (await this.agentAggregateService.getAgentVersionBrickDependencies(agentVersionId)).map(
      (agentVersionBrickDependency) => new HnBrickVersionDto(agentVersionBrickDependency.brickVersion)
    );
  }

  @Put('version/:versionId/style')
  async updateVersionStyle(
    @Param('versionId', ParseUUIDPipe) versionId: string,
    @Body() data: HnAgentEditStyleData
  ): Promise<HnAgentVersionDto> {
    return new HnAgentVersionDto(await this.agentAggregateService.updateVersionStyle(versionId, data));
  }

  ////////////////////////////////////////// CO AUTHORS //////////////////////////////////////////
  @Post('co-authors/:id/invite')
  async inviteAgentCoAuthor(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body('emailOrId') emailOrId: string
  ): Promise<boolean> {
    return this.agentAggregateService.inviteAgentCoAuthor(id, emailOrId);
  }

  @BlPublic()
  @Get('co-authors/:id')
  async getAgentCoAuthors(@Param('id', new ParseUUIDPipe()) id: string): Promise<HnUserDto[]> {
    return (await this.agentAggregateService.getAgentCoAuthors(id)).map(
      (agentCoAuthor) => new HnUserDto(agentCoAuthor.user)
    );
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
  ): Promise<TeBlockFileUploadResponse> {
    return this.agentAggregateService.saveFile(file, agentId);
  }

  @UseInterceptors(FileInterceptor('file'))
  @Post('image/:agentId')
  async saveImage(
    @BlUploadedFile() file: BlFile,
    @Param('agentId', new ParseUUIDPipe()) agentId: string
  ): Promise<TeBlockFigureUploadedResponse> {
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
