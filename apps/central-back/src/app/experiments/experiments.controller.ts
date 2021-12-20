import {Body, Controller, Get, Param, ParseUUIDPipe, Put} from '@nestjs/common';
import {Experiment} from './experiment.entity';
import {ExperimentsSecurityLayer} from './experiments-security-layer.service';
import {ExperimentStatusHistory} from './experiment-status-history.entity';
import {BlParsePipe} from '@monorepo/back-core-lib';

@Controller('experiments')
export class ExperimentsController {

  constructor(private securityLayer: ExperimentsSecurityLayer) {
  }


  @Put()
  update(@Body(new BlParsePipe(Experiment)) experiment: Experiment): Promise<Experiment> {
    return this.securityLayer.updateSecure(experiment);
  }


  @Get(':id')
  findById(@Param('id', new ParseUUIDPipe()) id: string): Promise<Experiment> {
    return this.securityLayer.findByIdAndCheckSecure(id);
  }


  /**
   * Return the list of experiment of a project
   */
  @Get('project/:projectId')
  public getExperimentOfProject(@Param('projectId', ParseUUIDPipe) projectId: string): Promise<Experiment[]> {
    return this.securityLayer.getExperimentsOfProject(projectId);
  }

  ////////////////////// STATUS ////////////////////
  /**
   * return the history of the status
   */
  @Get(':id/status-history')
  getStatusHistory(@Param('id', new ParseUUIDPipe()) id: string): Promise<ExperimentStatusHistory[]> {
    return this.securityLayer.getStatusHistory(id);
  }
}
