import {Body, Controller, Get, Param, ParseUUIDPipe, Put} from '@nestjs/common';
import {CnExperiment} from './cn-experiment.entity';
import {CnExperimentsSecurityLayer} from './cn-experiments-security-layer.service';
import {CnExperimentStatusHistory} from './cn-experiment-status-history.entity';
import {BlParsePipe} from '@monorepo/back-core-lib';

@Controller('experiments')
export class CnExperimentsController {

  constructor(private securityLayer: CnExperimentsSecurityLayer) {
  }


  @Put()
  update(@Body(new BlParsePipe(CnExperiment)) experiment: CnExperiment): Promise<CnExperiment> {
    return this.securityLayer.updateSecure(experiment);
  }


  @Get(':id')
  findById(@Param('id', new ParseUUIDPipe()) id: string): Promise<CnExperiment> {
    return this.securityLayer.findByIdAndCheckSecure(id);
  }


  /**
   * Return the list of experiment of a project
   */
  @Get('project/:projectId')
  public getExperimentOfProject(@Param('projectId', ParseUUIDPipe) projectId: string): Promise<CnExperiment[]> {
    return this.securityLayer.getExperimentsOfProject(projectId);
  }

  ////////////////////// STATUS ////////////////////
  /**
   * return the history of the status
   */
  @Get(':id/status-history')
  getStatusHistory(@Param('id', new ParseUUIDPipe()) id: string): Promise<CnExperimentStatusHistory[]> {
    return this.securityLayer.getStatusHistory(id);
  }
}
