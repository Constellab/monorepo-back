import {Controller, Get, Param, ParseUUIDPipe} from '@nestjs/common';
import {CnExperiment} from './cn-experiments/cn-experiment.entity';
import {CnExperimentDTO} from './cn-experiments/cn-experiment.dto';
import {CnProjectAggregateService} from './cn-project-aggregate.service';

@Controller('experiments')
export class CnExperimentsController {

  constructor(private projectAggregate: CnProjectAggregateService) {
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
}
