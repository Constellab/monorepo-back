import { Controller, Get, Param, ParseUUIDPipe } from '@nestjs/common';
import { CnScenario, CnScenarioProtocol } from './cn-scenario.entity';
import { CnScenarioDto } from './cn-scenario.dto';
import { CnFolderAggregateService } from '../cn-folder-aggregate.service';
import { CnLabConfig } from '../../cn-lab-configs/cn-lab-config.entity';

@Controller('scenarios')
export class CnScenariosController {
  constructor(private folderAggregateService: CnFolderAggregateService) {}

  @Get('current-last-scenarios')
  getCurrentUserLastScenarios(): Promise<CnScenario[]> {
    return this.folderAggregateService.getCurrentUserLastScenarios();
  }

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
}
