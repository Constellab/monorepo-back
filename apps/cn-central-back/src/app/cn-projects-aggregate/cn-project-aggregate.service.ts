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
import {CnExperiment, CnExperimentProtocol} from './cn-experiments/cn-experiment.entity';
import {CnCreateLabExperimentDto} from './cn-experiments/cn-experiment.dto';
import {CnCreateReportWithConfigDto} from './cn-reports/cn-report.dto';
import {CnReport} from './cn-reports/cn-report.entity';
import {IncomingMessage} from 'http';
import {CnGroupsService} from '../cn-groups/cn-groups.service';
import {CnErrorText} from '../cn-core/model/config/cn-error-text.class';
import {CnReportContent} from './cn-reports/cn-report-content.class';
import {CnLabConfig} from '../cn-lab-configs/cn-lab-config.entity';
import {CnProjectLevel, CnProjectLevelStatus} from './cn-projects/cn-project-level.enum';
import {CnProjectAncestorTreeDTO, CnProjectAncestorType} from './cn-projects/cn-project.dto';
import {DataSource} from 'typeorm';

@Injectable()
export class CnProjectAggregateService {


  constructor(private projectService: CnProjectsService,
              private projectSecurity: CnProjectsAggregateSecurity,
              private experimentService: CnExperimentsService,
              private reportService: CnReportsService,
              private groupService: CnGroupsService,
              private datasource: DataSource) {
  }

  /////////////////////////////////////// PROJECT //////////////////////////////////

  async createProject(entity: CnProject): Promise<CnProject> {
    entity.parent = null;
    entity.currentLevel = CnProjectLevel.PROJECT;
    entity.levelStatus = CnProjectLevelStatus.UNDEFINED;
    return this.projectService.create(entity);
  }

  async createSubProject(entity: CnProject, projectId: string): Promise<CnProject> {
    const parentProject = await this.getAndCheckAuthorizationForUpdate(projectId);

    // check if parent can have children
    if (parentProject.levelStatus === CnProjectLevelStatus.LEAF) {
      throw new BadRequestException('Cannot create a sub project to a leaf project');
    }

    if (parentProject.currentLevel >= CnProjectLevel.TASK) {
      throw new BadRequestException('Cannot create project with a hierarchy level more than 3');
    }

    // set hierarchy info
    entity.parent = parentProject;
    entity.currentLevel = parentProject.currentLevel + 1;
    // if the project is level 3 set the status to leaf, otherwise set to undefined
    entity.levelStatus = entity.currentLevel === CnProjectLevel.TASK ?
      CnProjectLevelStatus.LEAF : CnProjectLevelStatus.UNDEFINED;
    entity.rootParentId = parentProject.currentLevel === CnProjectLevel.PROJECT ? parentProject.id : parentProject.rootParentId;

    return await this.datasource.transaction(async entityManager => {
      const newProject = await this.projectService.create(entity, entityManager);

      // update the status of the parent to PARENT if undefined
      if (parentProject.levelStatus === CnProjectLevelStatus.UNDEFINED) {
        parentProject.levelStatus = CnProjectLevelStatus.PARENT;
        await this.projectService.update(parentProject, entityManager);
      }

      return newProject;
    });
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

    if (project.currentLevel !== CnProjectLevel.PROJECT) {
      throw new BadRequestException('Only projects can be shared');
    }

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

  public async getOnGoingProjectsNumber(): Promise<number> {
    return this.projectService.getOnGoingProjectsNumber();
  }

  public async getProjectTree(projectId: string): Promise<CnProject> {
    const project = await this.getAndCheckAuthorizationForFindOne(projectId);

    return await this.projectService.getProjectTree(project);
  }

  public async getChildren(projectId: string): Promise<CnProject[]> {
    const project = await this.getAndCheckAuthorizationForFindOne(projectId);

    return this.projectService.getChildren(project);
  }

  public async getObjectProjectAncestors(objectType: CnProjectAncestorType, objectId: string): Promise<CnProjectAncestorTreeDTO[]> {

    let ancestor: CnProjectAncestorTreeDTO;
    let projectId: string;
    switch (objectType) {
      case 'project':
        projectId = objectId;
        break;
      case 'experiment':
        const experiment = await this.experimentService.findByIdAndCheck(objectId);
        projectId = experiment.projectId;
        ancestor = {type: 'experiment', id: experiment.id, title: experiment.title};
        break;
      case 'report':
        const report = await this.reportService.findByIdAndCheck(objectId);
        projectId = report.projectId;
        ancestor = {type: 'report', id: report.id, title: report.title};
        break;
    }

    // retrieve the project ancestors
    const project = await this.findProject(projectId);
    const projectAncestors = await this.projectService.getAncestors(project);

    // if the object is an experiment or a report, add the ancestor
    if (ancestor) {
      projectAncestors.unshift(ancestor);
    }
    return projectAncestors;
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

    if (project.levelStatus === CnProjectLevelStatus.PARENT) {
      throw new BadRequestException(CnErrorText.EXP_MUST_BE_ASSOCIATED_WITH_LEAF_PROJECT);
    }

    return await this.datasource.transaction(async entityManager => {
      await this.experimentService.saveLabExperiment(project, createLabExperimentDto, entityManager);

      // if the project status was undefined, set it to LEAF
      if (project.levelStatus === CnProjectLevelStatus.UNDEFINED) {
        project.levelStatus = CnProjectLevelStatus.LEAF;
        await this.projectService.update(project, entityManager);
      }
    });
  }

  async deleteLabExperiment(projectId: string, experimentId: string): Promise<void> {
    // check that the user can update the project
    await this.getAndCheckAuthorizationForUpdate(projectId);

    await this.experimentService.deleteExperiment(experimentId);
  }

  async getCurrentUserLastExperiments(): Promise<CnExperiment[]> {
    return this.experimentService.getCurrentUserLastExperiments();
  }

  async findExperimentTechnicalReport(experimentId: string): Promise<CnExperimentProtocol> {
    return (await this.findExperiment(experimentId)).protocol;
  }

  async findExperimentLabConfig(experimentId: string): Promise<CnLabConfig> {
    return this.experimentService.getExperimentLabConfig(experimentId);
  }

  /////////////////////////////////////// REPORT //////////////////////////////////

  public async findReport(id: string): Promise<CnReport> {
    const report = await this.reportService.findByIdAndCheck(id);

    await this.getAndCheckAuthorizationForFindOne(report.projectId);
    return report;
  }

  async createLabReport(createReportDto: CnCreateReportWithConfigDto, projectId: string): Promise<void> {
    const project = await this.getAndCheckAuthorizationForUpdate(projectId);

    if (project.levelStatus === CnProjectLevelStatus.PARENT) {
      throw new BadRequestException(CnErrorText.REPORT_MUST_BE_ASSOCIATED_WITH_LEAF_PROJECT);
    }

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

    return await this.datasource.transaction(async entityManager => {
      await this.reportService.createReport(createReportDto, experiments, project, entityManager);

      // if the project status was undefined, set it to LEAF
      if (project.levelStatus === CnProjectLevelStatus.UNDEFINED) {
        project.levelStatus = CnProjectLevelStatus.LEAF;
        await this.projectService.update(project, entityManager);
      }
    });
  }

  async deleteLabReport(projectId: string, reportId: string): Promise<void> {
    // check that the user can update the project
    await this.getAndCheckAuthorizationForUpdate(projectId);

    await this.reportService.deleteReport(reportId);
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
    if (content.getFigureOp(filename) == null) {
      throw new UnauthorizedException();
    }
    return this.reportService.getImage(filename);
  }

  async getReportView(reportId: string, filename: string): Promise<IncomingMessage> {
    const report = await this.findReport(reportId);

    // check that the filename is in the report
    const content = new CnReportContent(report.content);
    if (content.getViewsOp(filename) == null) {
      throw new UnauthorizedException();
    }
    return this.reportService.getView(filename);
  }


  /////////////////////////////////////// SECURITY //////////////////////////////////


  private async getAndCheckAuthorizationForFindOne(projectId: string): Promise<CnProject> {
    const dbProject = await this.projectService.findWithSharedGroups(projectId);

    await this.projectSecurity.checkFindOne(dbProject, CnCurrentUserHelper.getAndCheckCurrentUser());
    return dbProject;
  }

  private async getAndCheckAuthorizationForUpdate(projectId: string): Promise<CnProject> {
    const dbProject = await this.projectService.findWithSharedGroups(projectId);

    await this.projectSecurity.checkUpdate(dbProject, CnCurrentUserHelper.getAndCheckCurrentUser());
    return dbProject;
  }
}
