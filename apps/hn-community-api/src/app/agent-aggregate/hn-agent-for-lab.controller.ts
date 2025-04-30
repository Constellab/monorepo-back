import { Body, Controller, Get, Param, ParseIntPipe, ParseUUIDPipe, Post, Query } from '@nestjs/common';
import { BlParsePipe } from '@monorepo/back-core-lib';
import { HnLabGuard } from '../core/decorators/hn-lab-auth-guard.decorator';
import {
  HaCreateAgentVersionFromLabResponseDto,
  HnAgentForLabDto,
  HnAgentVersionFileInput,
  HnAgentVersionForLabDto,
  HnCreateAgentDto,
} from './agent/hn-agent.dto';
import { HnAgentVersionMigrator } from './agent-version/hn-agent-version-migrator.class';
import { HnAgentAggregateService } from './hn-agent-aggregate.service';
import { ClPage } from '@monorepo/core-lib';

@HnLabGuard()
@Controller('agent/for-lab')
export class HnAgentForLabController {
  constructor(private readonly agentAggregateService: HnAgentAggregateService) {}

  @Post()
  async createForLab(
    @Body(new BlParsePipe(HnCreateAgentDto)) createAgentDto: HnCreateAgentDto
  ): Promise<HaCreateAgentVersionFromLabResponseDto> {
    const migrator: HnAgentVersionMigrator = new HnAgentVersionMigrator();
    createAgentDto.versionFile = migrator.migrateAgentVersionFile(createAgentDto.versionFile);
    return this.agentAggregateService.createForLab(createAgentDto);
  }

  @Post('fork/:id')
  async forkForLab(
    @Param('id', ParseUUIDPipe) agentId: string,
    @Body(new BlParsePipe(HnCreateAgentDto)) createAgentDto: HnCreateAgentDto
  ): Promise<HaCreateAgentVersionFromLabResponseDto> {
    const migrator: HnAgentVersionMigrator = new HnAgentVersionMigrator();
    createAgentDto.versionFile = migrator.migrateAgentVersionFile(createAgentDto.versionFile);
    return this.agentAggregateService.forkForLab(agentId, createAgentDto);
  }

  @Post('version/:id')
  async createNewVersionForLab(
    @Param('id', ParseUUIDPipe) agentId: string,
    @Body('versionFile') versionFile: HnAgentVersionFileInput
  ): Promise<HaCreateAgentVersionFromLabResponseDto> {
    const migrator: HnAgentVersionMigrator = new HnAgentVersionMigrator();
    versionFile = migrator.migrateAgentVersionFile(versionFile);
    return this.agentAggregateService.createNewVersionForLab(agentId, versionFile);
  }

  @Get('check-rights/version/:id/:jsonVersionNumber?')
  async getAgentForLabAndCheckRights(
    @Param('id', ParseUUIDPipe) agentId: string,
    @Param('jsonVersionNumber') jsonVersionNumber?: string
  ): Promise<HnAgentForLabDto> {
    return this.agentAggregateService.getAgentForLabAndCheckRights(
      agentId,
      this.getVersionNumber(jsonVersionNumber)
    );
  }

  @Get('version/:id/:jsonVersionNumber?')
  async getAgentForLab(
    @Param('id', ParseUUIDPipe) versionId: string,
    @Param('jsonVersionNumber') jsonVersionNumber?: string
  ): Promise<HnAgentForLabDto> {
    return this.agentAggregateService.getAgentForLabByVersionId(
      versionId,
      this.getVersionNumber(jsonVersionNumber)
    );
  }

  /**
   * Get latest published agent version by agent id for lab
   * @param agentId
   * @param jsonVersionNumber
   * @return an agent version code
   */
  @Get(':agentId/version/latest/:jsonVersionNumber?')
  async getLatestPublishedAgentVersionForLabByAgentId(
    @Param('agentId', ParseUUIDPipe) agentId: string,
    @Param('jsonVersionNumber') jsonVersionNumber?: string
  ): Promise<HnAgentVersionForLabDto> {
    return await this.agentAggregateService.findLatestPublishedAgentVersionForLabByAgentId(
      agentId,
      this.getVersionNumber(jsonVersionNumber)
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
  @Post('available')
  async getAgentsForLab(
    @Body('spacesFilter') spacesFilter: string[],
    @Body('titleFilter') titleFilter: string,
    @Body('personalOnly') personalOnly: boolean,
    @Query('page', new ParseIntPipe()) page: number,
    @Query('size', new ParseIntPipe()) size: number
  ): Promise<ClPage<HnAgentForLabDto>> {
    return this.agentAggregateService.getAgentsForLab(spacesFilter, titleFilter, personalOnly, page, size);
  }

  private getVersionNumber(jsonVersionNumber: string): number {
    let versionNumber = null;
    if (!jsonVersionNumber) {
      versionNumber = 1;
    } else {
      versionNumber = +jsonVersionNumber;
    }
    return versionNumber;
  }
}
