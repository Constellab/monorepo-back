import { Controller, Get, Param, ParseUUIDPipe, Post } from '@nestjs/common';
import { CnExperiment, CnExperimentProtocol } from './cn-experiment.entity';
import { CnExperimentDTO } from './cn-experiment.dto';
import { CnProjectAggregateService } from '../cn-project-aggregate.service';
import { CnLabConfig } from '../../cn-lab-configs/cn-lab-config.entity';

@Controller('experiments')
export class CnExperimentsController {

  constructor(private projectAggregate: CnProjectAggregateService) {
  }


  @Get('current-last-experiments')
  getCurrentUserLastExperiments(): Promise<CnExperiment[]> {
    return this.projectAggregate.getCurrentUserLastExperiments();
  }

  @Get(':id')
  findById(@Param('id', new ParseUUIDPipe()) id: string): Promise<CnExperiment> {
    return this.projectAggregate.findExperiment(id);
  }


  /**
   * Return the list of experiment of a project
   */
  @Get('project/:projectId')
  public async getExperimentsByProject(@Param('projectId', ParseUUIDPipe) projectId: string): Promise<CnExperimentDTO[]> {
    const experiments = await this.projectAggregate.getExperimentsByProject(projectId);
    return experiments.map(experiment => new CnExperimentDTO().copyEntity(experiment));
  }

  @Get('report/:reportId')
  async getExperimentsByReport(@Param('reportId', new ParseUUIDPipe()) reportId: string): Promise<CnExperimentDTO[]> {
    const experiments = await this.projectAggregate.getExperimentsAssociatedToReports(reportId);
    return experiments.map(experiment => new CnExperimentDTO().copyEntity(experiment));
  }

  /**
   * Get experiment's reports
   */
  @Get(':experimentId/technical-report')
  async getExperimentTechnicalReport(@Param('experimentId', new ParseUUIDPipe()) experimentId: string): Promise<CnExperimentProtocol> {
    return this.projectAggregate.findExperimentTechnicalReport(experimentId);
  }

  /**
   * Get experiment's lab config
   */
  @Get(':experimentId/lab-config')
  async getExperimentLabConfig(@Param('experimentId', new ParseUUIDPipe()) experimentId: string): Promise<CnLabConfig> {
    return this.projectAggregate.findExperimentLabConfig(experimentId);
  }

  @Post('migrate-protocol')
  async migrateProtocol(): Promise<void> {
    return this.projectAggregate.migrateAllExperimentsProtocol();
  }

}
