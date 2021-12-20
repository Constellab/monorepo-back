import {Body, Controller, Get, Param, ParseUUIDPipe, Post, Put} from '@nestjs/common';
import {LabInstanceStatus} from '../lab-instances/lab-instance-status.enum';
import {LabInstance} from '../lab-instances/lab-instance.entity';
import {LabInstancesService} from '../lab-instances/lab-instances.service';
import {LabGuard} from '../core/decorators/lab-guard.decorator';
import {ReportsSecurityLayer} from '../reports/reports-security.layer';
import {Report} from '../reports/report.entity';
import {BlParseEnumPipe, BlParsePipe} from '@monorepo/back-core-lib';
import {CurrentUserHelper} from '../core/utils/current-user.helper';
import {LabExperimentDto} from '../experiments/lab-experiment.dto';
import {ExperimentsSecurityLayer} from '../experiments/experiments-security-layer.service';
import {Project} from '../projects/project.entity';
import {ProjectsSecurityLayer} from '../projects/projects-security.layer';

/**
 * Specific controller for route called by the lab servers. These routes are not called by a user
 */
@LabGuard()
@Controller('external-labs')
export class ExternalLabsController {

  constructor(private labInstanceService: LabInstancesService,
              private reportSecurityLayer: ReportsSecurityLayer,
              private projectSecurityLayer: ProjectsSecurityLayer,
              private experimentSecurityLayer: ExperimentsSecurityLayer) {
  }

  @Get('/user/:userId/projects')
  getProjectsOfUser(
    @Param('userId', new ParseUUIDPipe()) userId: string): Promise<Project[]> {
    return this.projectSecurityLayer.getProjectsOfUser(userId);
  }

  @Put('/lab-instance/status/:status')
  updateLabInstanceStatus(
    @Param('status', new BlParseEnumPipe(LabInstanceStatus)) status: LabInstanceStatus): Promise<LabInstance> {
    return this.labInstanceService.updateCurrentStatus(status, CurrentUserHelper.getAndCheckCurrentLabInstance().id);
  }


  @Put('project/:projectId/add-experiment')
  createOrUpdateExperiment(
    @Param('projectId', new ParseUUIDPipe()) projectId: string,
    @Body(new BlParsePipe(LabExperimentDto)) labExperimentDto: LabExperimentDto): Promise<void> {
    return this.experimentSecurityLayer.createLabExperiment(projectId, labExperimentDto);
  }


  @Post('experiment/:experimentId/report')
  saveReportForExperiment(
    @Param('experimentId', new ParseUUIDPipe()) experimentId: string): Promise<Report> {
    // todo send the object
    return this.reportSecurityLayer.createReport(null, experimentId);
  }
}
