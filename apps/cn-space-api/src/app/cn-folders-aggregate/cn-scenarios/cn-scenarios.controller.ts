import { Controller, Get, Param, ParseUUIDPipe } from '@nestjs/common';
import { CnLabConfig } from '../../cn-lab-configs/cn-lab-config.entity';
import { CnHierarchyObjectTokenDecorator } from '../cn-hierarchy-object-token/cn-hierarchy-object-token-guard.decorator';
import { CnScenarioAggregateService } from './cn-scenario-aggregate.service';
import { CnScenarioProtocol } from './cn-scenario-protocol.class';
import { CnScenarioDto } from './cn-scenario.dto';
import { CnScenario } from './cn-scenario.entity';

@Controller('scenarios')
export class CnScenariosController {
  constructor(private scenarioAggregateService: CnScenarioAggregateService) {}

  @CnHierarchyObjectTokenDecorator()
  @Get(':id')
  findById(@Param('id', new ParseUUIDPipe()) id: string): Promise<CnScenario> {
    return this.scenarioAggregateService.findScenario(id);
  }

  @Get('note/:noteId')
  async getScenariosByNote(@Param('noteId', new ParseUUIDPipe()) noteId: string): Promise<CnScenarioDto[]> {
    const scenarios = await this.scenarioAggregateService.getScenariosAssociatedToNotes(noteId);
    return scenarios.map((scenario) => new CnScenarioDto().copyEntity(scenario));
  }

  /**
   * Get scenario's notes
   */
  @CnHierarchyObjectTokenDecorator()
  @Get(':scenarioId/technical-report')
  async getScenarioTechnicalReport(
    @Param('scenarioId', new ParseUUIDPipe()) scenarioId: string
  ): Promise<CnScenarioProtocol> {
    return this.scenarioAggregateService.findScenarioTechnicalReport(scenarioId);
  }

  /**
   * Get scenario's lab config
   */
  @CnHierarchyObjectTokenDecorator()
  @Get(':scenarioId/lab-config')
  async getScenarioLabConfig(
    @Param('scenarioId', new ParseUUIDPipe()) scenarioId: string
  ): Promise<CnLabConfig> {
    return this.scenarioAggregateService.findScenarioLabConfig(scenarioId);
  }
}
