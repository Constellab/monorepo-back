import {Body, Controller, Get, Param, ParseUUIDPipe, Put, UploadedFiles, UseInterceptors} from '@nestjs/common';
import {CnLabInstanceStatus} from '../cn-lab-instances/cn-lab-instance-status.enum';
import {CnLabInstance} from '../cn-lab-instances/cn-lab-instance.entity';
import {CnLabInstancesService} from '../cn-lab-instances/cn-lab-instances.service';
import {ClLabGuard} from '../cn-core/decorators/cn-lab-guard.decorator';
import {CnReportsSecurityLayer} from '../cn-reports/cn-reports-security.layer';
import {CnReport} from '../cn-reports/cn-report.entity';
import {BlFile, BlParseEnumPipe, BlParsePipe} from '@monorepo/back-core-lib';
import {CnCurrentUserHelper} from '../cn-core/utils/cn-current-user.helper';
import {CnCreateLabExperimentDto} from '../cn-experiments/cn-experiment.dto';
import {CnExperimentsSecurityLayer} from '../cn-experiments/cn-experiments-security-layer.service';
import {CnProject} from '../cn-projects/cn-project.entity';
import {CnProjectsSecurityLayer} from '../cn-projects/cn-projects-security.layer';
import {CnCreateReportDto} from '../cn-reports/cn-report.dto';
import {FilesInterceptor} from '@nestjs/platform-express';
import {ClCoreJsonConvert} from '@monorepo/core-lib';

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
    @Body(new BlParsePipe(CnCreateLabExperimentDto)) createLabExperimentDto: CnCreateLabExperimentDto): Promise<void> {
    return this.experimentSecurityLayer.createLabExperiment(projectId, createLabExperimentDto);
  }


  @UseInterceptors(FilesInterceptor('files'))
  @Put('project/:projectId/report')
  saveReport(
    @Param('projectId', new ParseUUIDPipe()) projectId: string,
    @Body() body: { body: string },
    @UploadedFiles() files: BlFile[]): Promise<CnReport> {
    const createReportDto: CnCreateReportDto = ClCoreJsonConvert.deserializeObject(JSON.parse(body.body), CnCreateReportDto);
    return this.reportSecurityLayer.createReport(createReportDto, projectId, files);
  }
}
