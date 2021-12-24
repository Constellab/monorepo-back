import {Body, Controller, Get, Param, ParseUUIDPipe, Put} from '@nestjs/common';
import {CnLabInstanceStatus} from '../cn-lab-instances/cn-lab-instance-status.enum';
import {CnLabInstance} from '../cn-lab-instances/cn-lab-instance.entity';
import {CnLabInstancesService} from '../cn-lab-instances/cn-lab-instances.service';
import {ClLabGuard} from '../cn-core/decorators/cn-lab-guard.decorator';
import {CnReportsSecurityLayer} from '../cn-reports/cn-reports-security.layer';
import {CnReport} from '../cn-reports/cn-report.entity';
import {BlParseEnumPipe, BlParsePipe} from '@monorepo/back-core-lib';
import {CnCurrentUserHelper} from '../cn-core/utils/cn-current-user.helper';
import {CnLabExperimentDto} from '../cn-experiments/cn-experiment.dto';
import {CnExperimentsSecurityLayer} from '../cn-experiments/cn-experiments-security-layer.service';
import {CnProject} from '../cn-projects/cn-project.entity';
import {CnProjectsSecurityLayer} from '../cn-projects/cn-projects-security.layer';
import {CnCreateReportDto} from '../cn-reports/cn-report.dto';

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


  @Put('project/:projectId/experiment')
  createOrUpdateExperiment(
    @Param('projectId', new ParseUUIDPipe()) projectId: string,
    @Body(new BlParsePipe(CnLabExperimentDto)) labExperimentDto: CnLabExperimentDto): Promise<void> {
    return this.experimentSecurityLayer.createLabExperiment(projectId, labExperimentDto);
  }


  @Put('project/:projectId/report')
  saveReport(
    @Param('projectId', new ParseUUIDPipe()) projectId: string,
    @Body(new BlParsePipe(CnCreateReportDto)) createReportDto: CnCreateReportDto): Promise<CnReport> {
    return this.reportSecurityLayer.createReport(createReportDto, projectId);
  }
}
