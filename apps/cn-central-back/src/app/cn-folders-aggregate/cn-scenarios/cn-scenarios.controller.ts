import { Controller, Get, Param, ParseUUIDPipe, Post } from '@nestjs/common';
import { CnScenario } from './cn-scenario.entity';
import { CnScenarioDto } from './cn-scenario.dto';
import { CnFolderAggregateService } from '../cn-folder-aggregate.service';
import { CnLabConfig } from '../../cn-lab-configs/cn-lab-config.entity';
import { CnScenarioProtocol } from './cn-scenario-protocol.class';
import { BlUserCategory } from '@monorepo/back-core-lib';
import { CnUserCategories } from '../../cn-core/decorators/cn-user-category.decorator';

@Controller('scenarios')
export class CnScenariosController {
  constructor(private folderAggregateService: CnFolderAggregateService) {}

  @Get(':id')
  findById(@Param('id', new ParseUUIDPipe()) id: string): Promise<CnScenario> {
    return this.folderAggregateService.findScenario(id);
  }

  /**
   * Return the list of scenario of a folder
   */
  @Get('folder/:folderId')
  public async getScenariosByFolder(
    @Param('folderId', ParseUUIDPipe) folderId: string
  ): Promise<CnScenarioDto[]> {
    const scenarios = await this.folderAggregateService.getScenariosByFolder(folderId);
    return scenarios.map((scenario) => new CnScenarioDto().copyEntity(scenario));
  }

  @Get('note/:noteId')
  async getScenariosByNote(@Param('noteId', new ParseUUIDPipe()) noteId: string): Promise<CnScenarioDto[]> {
    const scenarios = await this.folderAggregateService.getScenariosAssociatedToNotes(noteId);
    return scenarios.map((scenario) => new CnScenarioDto().copyEntity(scenario));
  }

  /**
   * Get scenario's notes
   */
  @Get(':scenarioId/technical-report')
  async getScenarioTechnicalReport(
    @Param('scenarioId', new ParseUUIDPipe()) scenarioId: string
  ): Promise<CnScenarioProtocol> {
    return this.folderAggregateService.findScenarioTechnicalReport(scenarioId);
  }

  /**
   * Get scenario's lab config
   */
  @Get(':scenarioId/lab-config')
  async getScenarioLabConfig(
    @Param('scenarioId', new ParseUUIDPipe()) scenarioId: string
  ): Promise<CnLabConfig> {
    return this.folderAggregateService.findScenarioLabConfig(scenarioId);
  }

  @CnUserCategories(BlUserCategory.ADMIN)
  @Post('fix-protocols')
  async fixProtocols(): Promise<void> {
    await this.folderAggregateService.fixProtocols();
  }
}
