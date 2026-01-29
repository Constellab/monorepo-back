import { BlParsePipe, BlPublic } from '@monorepo/back-core-lib';
import { ClPage } from '@monorepo/core-lib';
import { Body, Controller, Get, Param, ParseIntPipe, ParseUUIDPipe, Post, Query } from '@nestjs/common';

import { HnLabGuard } from '../core/decorators/hn-lab-auth-guard.decorator';
import {
  HnAgentForLabDto,
  HnAgentVersionFileInput,
  HnAgentVersionForLabDtoOldFormat,
  HnCreateAgentDto,
  HnCreateAgentVersionFromLabResponseDtoOldFormat,
} from './agent/hn-agent.dto';
import { HnAgentVersionMigrator } from './agent-version/hn-agent-version-migrator.class';
import { HnAgentAggregateService } from './hn-agent-aggregate.service';

@Controller('live-task')
export class HnTempLiveTaskController {
  constructor(private readonly agentAggregateService: HnAgentAggregateService) {}

  @BlPublic()
  @HnLabGuard()
  @Post('/for-lab')
  async createForLab(
    @Body(new BlParsePipe(HnCreateAgentDto)) createAgentDto: HnCreateAgentDto
  ): Promise<HnCreateAgentVersionFromLabResponseDtoOldFormat> {
    const migrator: HnAgentVersionMigrator = new HnAgentVersionMigrator();
    createAgentDto.versionFile = migrator.migrateAgentVersionFile(createAgentDto.versionFile);
    return new HnCreateAgentVersionFromLabResponseDtoOldFormat(
      await this.agentAggregateService.createForLab(createAgentDto)
    );
  }

  @BlPublic()
  @HnLabGuard()
  @Post('/for-lab/fork/:id')
  async forkForLab(
    @Param('id') agentVersionId: string,
    @Body(new BlParsePipe(HnCreateAgentDto)) createAgentDto: HnCreateAgentDto
  ): Promise<HnCreateAgentVersionFromLabResponseDtoOldFormat> {
    const migrator: HnAgentVersionMigrator = new HnAgentVersionMigrator();
    createAgentDto.versionFile = migrator.migrateAgentVersionFile(createAgentDto.versionFile);
    return new HnCreateAgentVersionFromLabResponseDtoOldFormat(
      await this.agentAggregateService.forkForLab(agentVersionId, createAgentDto)
    );
  }

  @BlPublic()
  @HnLabGuard()
  @Post('/for-lab/version/:id')
  async createNewVersionForLab(
    @Param('id', ParseUUIDPipe) agentId: string,
    @Body('versionFile') versionFile: HnAgentVersionFileInput
  ): Promise<HnCreateAgentVersionFromLabResponseDtoOldFormat> {
    const migrator: HnAgentVersionMigrator = new HnAgentVersionMigrator();
    versionFile = migrator.migrateAgentVersionFile(versionFile);
    return new HnCreateAgentVersionFromLabResponseDtoOldFormat(
      await this.agentAggregateService.createNewVersionForLab(agentId, versionFile)
    );
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
   * Get latest published agent version by agent id for lab
   * @param agentId
   * @return a agent version code
   */
  @BlPublic()
  @HnLabGuard()
  @Get(':agentId/version/latest/for-lab/:jsonVersionNumber?')
  async getLatestPublishedAgentVersionForLabByAgentId(
    @Param('agentId', ParseUUIDPipe) agentId: string,
    @Param('jsonVersionNumber') jsonVersionNumber?: string
  ): Promise<HnAgentVersionForLabDtoOldFormat> {
    let versionNumber = null;
    if (!jsonVersionNumber) {
      versionNumber = 1;
    } else {
      versionNumber = +jsonVersionNumber;
    }
    return new HnAgentVersionForLabDtoOldFormat(
      await this.agentAggregateService.findLatestPublishedAgentVersionForLabByAgentId(agentId, versionNumber)
    );
  }
}
