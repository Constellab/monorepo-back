import {Body, Controller, Get, Param, ParseUUIDPipe, Post, Put} from '@nestjs/common';
import {CnLabInstanceStatus} from '../cn-lab-instances/cn-lab-instance-status.enum';
import {CnLabInstance} from '../cn-lab-instances/cn-lab-instance.entity';
import {CnLabInstancesService} from '../cn-lab-instances/cn-lab-instances.service';
import {ClLabGuard} from '../cn-core/decorators/cn-lab-guard.decorator';
import {CnReportsSecurityLayer} from '../cn-reports/cn-reports-security.layer';
import {Report} from '../cn-reports/cn-report.entity';
import {BlParseEnumPipe, BlParsePipe} from '@monorepo/back-core-lib';
import {CnCurrentUserHelper} from '../cn-core/utils/cn-current-user.helper';
import {CnLabExperimentDto} from '../cn-experiments/cn-lab-experiment.dto';
import {CnExperimentsSecurityLayer} from '../cn-experiments/cn-experiments-security-layer.service';
import {CnProject} from '../cn-projects/cn-project.entity';
import {CnProjectsSecurityLayer} from '../cn-projects/cn-projects-security.layer';

/**
 * Specific controller for route called by the lab servers. These routes are not called by a user
 */
@ClLabGuard()
@Controller('external-labs')
export class CnExternalLabsController {

  constructor(private labInstanceService: CnLabInstancesService,
              private reportSecurityLayer: CnReportsSecurityLayer,
              private projectSecurityLayer: CnProjectsSecurityLayer,
              private experimentSecurityLayer: CnExperimentsSecurityLayer) {
  }

  @Get('/user/:userId/projects')
  getProjectsOfUser(
    @Param('userId', new ParseUUIDPipe()) userId: string): Promise<CnProject[]> {
    return this.projectSecurityLayer.getProjectsOfUser(userId);
  }

  @Put('/lab-instance/status/:status')
  updateLabInstanceStatus(
    @Param('status', new BlParseEnumPipe(CnLabInstanceStatus)) status: CnLabInstanceStatus): Promise<CnLabInstance> {
    return this.labInstanceService.updateCurrentStatus(status, CnCurrentUserHelper.getAndCheckCurrentLabInstance().id);
  }


  @Put('project/:projectId/add-experiment')
  createOrUpdateExperiment(
    @Param('projectId', new ParseUUIDPipe()) projectId: string,
    @Body(new BlParsePipe(CnLabExperimentDto)) labExperimentDto: CnLabExperimentDto): Promise<void> {
    return this.experimentSecurityLayer.createLabExperiment(projectId, labExperimentDto);
  }


  @Post('experiment/:experimentId/report')
  saveReportForExperiment(
    @Param('experimentId', new ParseUUIDPipe()) experimentId: string): Promise<Report> {
    // todo send the object
    return this.reportSecurityLayer.createReport(null, experimentId);
  }
}
