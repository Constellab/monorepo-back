import {Body, Controller, Get, Param, ParseUUIDPipe, Post, Put} from '@nestjs/common';
import {Experiment} from './experiment.entity';
import {ExperimentStatus} from './experiment-status.enum';
import {ExperimentsSecurityLayer} from './experiments-security-layer.service';
import {ExperimentStatusHistory} from './experiment-status-history.entity';
import {BlParseEnumPipe, BlParsePipe} from '@monorepo/back-core-lib';

@Controller('experiments')
export class ExperimentsController {

  constructor(private securityLayer: ExperimentsSecurityLayer) {
  }

  /**
   * Create an experiment for a study
   */
  @Post('study/:studyId')
  create(@Body(new BlParsePipe(Experiment)) experiment: Experiment,
         @Param('studyId', ParseUUIDPipe) studyId: string): Promise<Experiment> {
    return this.securityLayer.createExperiment(experiment, studyId);
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
   * Return the list of experiment of a study
   */
  @Get('study/:studyId')
  public getExperimentOfStudy(@Param('studyId', ParseUUIDPipe) studyId: string): Promise<Experiment[]> {
    return this.securityLayer.getExperimentsOfStudy(studyId);
  }

  ////////////////////// STATUS ////////////////////
  /**
   * return the history of the status
   */
  @Get(':id/status-history')
  getStatusHistory(@Param('id', new ParseUUIDPipe()) id: string): Promise<ExperimentStatusHistory[]> {
    return this.securityLayer.getStatusHistory(id);
  }


  @Put('/:id/status/:status')
  updateStatus(@Param('id', new ParseUUIDPipe()) id: string,
               @Param('status', new BlParseEnumPipe(ExperimentStatus)) status: ExperimentStatus): Promise<Experiment> {
    return this.securityLayer.updateCurrentStatus(status, id);
  }
}
