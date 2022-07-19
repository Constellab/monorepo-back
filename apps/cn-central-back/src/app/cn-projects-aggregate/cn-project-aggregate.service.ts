import {BadRequestException, Injectable, UnauthorizedException} from '@nestjs/common';
import {CnProjectsService} from './cn-projects/cn-projects.service';
import {CnProjectsAggregateSecurity} from './cn-projects-aggregate.security';
import {CnProject} from './cn-projects/cn-project.entity';
import {CnCurrentUserHelper} from '../cn-core/utils/cn-current-user.helper';
import {ClPageI} from '@monorepo/core-lib';
import {CnGroup} from '../cn-groups/cn-group.entity';
import {CnProjectStatusHistory} from './cn-projects/cn-project-status-history.entity';
import {CnProjectStatus} from './cn-projects/cn-project-status.enum';
import {CnExperimentsService} from './cn-experiments/cn-experiments.service';
import {CnReportsService} from './cn-reports/cn-reports.service';
import {CnExperiment} from './cn-experiments/cn-experiment.entity';
import {CnCreateLabExperimentDto} from './cn-experiments/cn-experiment.dto';
import {CnCreateReportWithConfigDto} from './cn-reports/cn-report.dto';
import {CnReport} from './cn-reports/cn-report.entity';
import {IncomingMessage} from 'http';
import {CnGroupsService} from '../cn-groups/cn-groups.service';
import {CnErrorText} from '../cn-core/model/config/cn-error-text.class';
import {CnReportContent} from './cn-reports/cn-report-content.class';

@Injectable()
export class CnProjectAggregateService {


  constructor(private projectService: CnProjectsService,
              private projectSecurity: CnProjectsAggregateSecurity,
              private experimentService: CnExperimentsService,
              private reportService: CnReportsService,
              private groupService: CnGroupsService) {
  }

  /////////////////////////////////////// PROJECT //////////////////////////////////

  async createProject(entity: CnProject): Promise<CnProject> {
    return this.projectService.create(entity);
  }

  async updateProject(entity: CnProject): Promise<CnProject> {
    const dbProject = await this.getAndCheckAuthorizationForUpdate(entity.id);
    return this.projectService.updateWithCompare(entity, dbProject);
  }

  async findProject(id: string): Promise<CnProject> {
    return this.getAndCheckAuthorizationForFindOne(id);
  }

  public async getCurrentProjects(page: number, size: number): Promise<ClPageI<CnProject>> {
    return this.projectService.getCurrentProjects(page, size);
  }

  public async getProjectOfTeam(groupId: string, page: number, size: number): Promise<ClPageI<CnProject>> {
    // check if the user can view the group
    await this.groupService.getAndCheckTeamById(groupId);

    return this.projectService.getProjectsOfGroup(groupId, page, size);
  }

  public async shareProject(projectId: string, groupId: string): Promise<CnGroup> {
    const project = await this.getAndCheckAuthorizationForUpdate(projectId);

    // the user must be an admin or be in the group he shared the project
    const user = CnCurrentUserHelper.getAndCheckCurrentUser();
    if (!user.isAdmin() && !(await this.groupService.currentUserIsInGroup(groupId))) {
      throw new UnauthorizedException();
    }

    return this.projectService.shareProject(project, groupId);
  }

  public async unshareProject(projectId: string, groupId: string): Promise<void> {
    const project = await this.getAndCheckAuthorizationForUpdate(projectId);

    if (project.sharedGroups.length <= 1) {
      throw new BadRequestException(CnErrorText.PROJECT_MUST_HAVE_A_GROUP);
    }

    return this.projectService.unshareProject(project, groupId);
  }

  public async getProjectSharedGroups(projectId: string): Promise<CnGroup[]> {
    const project = await this.getAndCheckAuthorizationForFindOne(projectId);
    return project.sharedGroups;
  }

  public async getProjectsOfUserId(userId: string): Promise<CnProject[]> {
    return this.projectService.getProjectsOfUserId(userId);
  }

  public async getOnGoingProjectsNumber(): Promise<number>{
    return this.projectService.getOnGoingProjectsNumber();
  }


  /////////////////////////////////////// PROJECT STATUS //////////////////////////////////


  async updateProjectCurrentStatus(status: CnProjectStatus, id: string): Promise<CnProject> {
    const project = await this.getAndCheckAuthorizationForUpdate(id);

    return this.projectService.updateCurrentStatusWithDbEntity(status, project);
  }

  public async getProjectStatusHistory(projectId: string): Promise<CnProjectStatusHistory[]> {
    await this.getAndCheckAuthorizationForFindOne(projectId);

    return await this.projectService.getStatusHistory(projectId) as CnProjectStatusHistory[];
  }

  /////////////////////////////////////// EXPERIMENT //////////////////////////////////

  public async findExperiment(id: string): Promise<CnExperiment> {
    const experiment = await this.experimentService.findByIdAndCheck(id);

    await this.getAndCheckAuthorizationForFindOne(experiment.projectId);
    return experiment;
  }

  async getExperimentsByProject(projectId: string): Promise<CnExperiment[]> {
    // check that the user can get the project
    await this.getAndCheckAuthorizationForFindOne(projectId);

    return this.experimentService.getExperimentsByProject(projectId);
  }

  async getExperimentsAssociatedToReports(reportId: string): Promise<CnExperiment[]> {
    // check that the user can get the project
    await this.findReport(reportId);

    return (await this.reportService.findByIdAndCheckWithExperiments(reportId)).experiments;
  }

  async createLabExperiment(projectId: string, createLabExperimentDto: CnCreateLabExperimentDto): Promise<void> {
    // check that the user can update the project
    const project = await this.getAndCheckAuthorizationForUpdate(projectId);

    await this.experimentService.createLabExperiment(project, createLabExperimentDto);
  }

  async getCurrentUserLastExperiments(): Promise<CnExperiment[]>{
    return this.experimentService.getCurrentUserLastExperiments();
  }

  /////////////////////////////////////// REPORT //////////////////////////////////

  public async findReport(id: string): Promise<CnReport> {
    const report = await this.reportService.findByIdAndCheck(id);

    await this.getAndCheckAuthorizationForFindOne(report.projectId);
    return report;
  }

  async createReport(createReportDto: CnCreateReportWithConfigDto, projectId: string): Promise<CnReport> {
    const project = await this.getAndCheckAuthorizationForUpdate(projectId);

    // get and check all experiment
    const experiments: CnExperiment[] = [];
    for (const experimentId of createReportDto.experiment_ids) {
      const experiment: CnExperiment = await this.experimentService.findById(experimentId);

      if (experiment == null) {
        throw new BadRequestException('Can\'t create the report because one of the linked experiment could not be found');
      }

      if (experiment.projectId !== project.id) {
        throw new BadRequestException('Can\'t create the report because it is linked to an experiment of another project');
      }
      experiments.push(experiment);
    }
    return this.reportService.createReport(createReportDto, experiments, project);
  }

  async getReportAssociatedToExperiment(experimentId: string): Promise<CnReport[]> {
    await this.findExperiment(experimentId);

    return (await this.experimentService.findByIdAndCheckWithReports(experimentId)).reports;
  }

  async getReportsByProject(projectId: string): Promise<CnReport[]> {
    // check that the user can get the project
    await this.getAndCheckAuthorizationForFindOne(projectId);

    return this.reportService.getReportsByProject(projectId);
  }

  async getReportImage(reportId: string, filename: string): Promise<IncomingMessage> {
    // check that the user can get the report
    const report = await this.findReport(reportId);

    // check that the filename is in the report
    const content = new CnReportContent(report.content);
    if(content.getFigureOp(filename) == null) {
      throw new UnauthorizedException();
    }
    return this.reportService.getImage(filename);
  }

  async getReportView(reportId: string, filename: string): Promise<IncomingMessage> {
    const report = await this.findReport(reportId);

    // check that the filename is in the report
    const content = new CnReportContent(report.content);
    if(content.getViewsOp(filename) == null) {
      throw new UnauthorizedException();
    }
    return this.reportService.getView(filename);
  }


  /////////////////////////////////////// SECURITY //////////////////////////////////


  private async getAndCheckAuthorizationForFindOne(projectId: string): Promise<CnProject> {
    const dbProject = await this.projectService.getProjectWithSharedGroups(projectId);

    await this.projectSecurity.checkFindOne(dbProject, CnCurrentUserHelper.getAndCheckCurrentUser());
    return dbProject;
  }

  private async getAndCheckAuthorizationForUpdate(projectId: string): Promise<CnProject> {
    const dbProject = await this.projectService.getProjectWithSharedGroups(projectId);

    await this.projectSecurity.checkUpdate(dbProject, CnCurrentUserHelper.getAndCheckCurrentUser());
    return dbProject;
  }
}
