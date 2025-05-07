import { Controller, Get, Param, ParseUUIDPipe } from '@nestjs/common';
import { CnScenario } from './cn-scenario.entity';
import { CnScenarioDto } from './cn-scenario.dto';
import { CnLabConfig } from '../../cn-lab-configs/cn-lab-config.entity';
import { CnScenarioProtocol } from './cn-scenario-protocol.class';
import { CnScenarioAggregateService } from '../cn-scenario-aggregate.service';

@Controller('scenarios')
export class CnScenariosController {
  constructor(private scenarioAggregateService: CnScenarioAggregateService) {}

  @Get(':id')
  findById(@Param('id', new ParseUUIDPipe()) id: string): Promise<CnScenario> {
    return this.scenarioAggregateService.findScenario(id);
  }

  /**
   * Return the list of scenario of a folder
   */
  @Get('folder/:folderId')
  public async getScenariosByFolder(
    @Param('folderId', ParseUUIDPipe) folderId: string
  ): Promise<CnScenarioDto[]> {
    const scenarios = await this.scenarioAggregateService.getScenariosByFolder(folderId);
    return scenarios.map((scenario) => new CnScenarioDto().copyEntity(scenario));
  }

  @Get('note/:noteId')
  async getScenariosByNote(@Param('noteId', new ParseUUIDPipe()) noteId: string): Promise<CnScenarioDto[]> {
    const scenarios = await this.scenarioAggregateService.getScenariosAssociatedToNotes(noteId);
    return scenarios.map((scenario) => new CnScenarioDto().copyEntity(scenario));
  }

  /**
   * Get scenario's notes
   */
  @Get(':scenarioId/technical-report')
  async getScenarioTechnicalReport(
    @Param('scenarioId', new ParseUUIDPipe()) scenarioId: string
  ): Promise<CnScenarioProtocol> {
    return this.scenarioAggregateService.findScenarioTechnicalReport(scenarioId);
  }

  /**
   * Get scenario's lab config
   */
  @Get(':scenarioId/lab-config')
  async getScenarioLabConfig(
    @Param('scenarioId', new ParseUUIDPipe()) scenarioId: string
  ): Promise<CnLabConfig> {
    return this.scenarioAggregateService.findScenarioLabConfig(scenarioId);
  }
}
