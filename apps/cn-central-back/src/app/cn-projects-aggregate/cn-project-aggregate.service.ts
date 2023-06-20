import {Injectable, Logger} from '@nestjs/common';
import {CnProjectsService} from './cn-projects/cn-projects.service';
import {CnProjectsAggregateSecurity} from './cn-projects-aggregate.security';
import {CnProject} from './cn-projects/cn-project.entity';
import {CnCurrentUserHelper} from '../cn-core/utils/cn-current-user.helper';
import {ClPage, ClPageI} from '@monorepo/core-lib';
import {CnGroup, CnGroupSingleUser} from '../cn-groups/cn-group.entity';
import {CnProjectStatusHistory} from './cn-projects/cn-project-status-history.entity';
import {CnProjectStatus} from './cn-projects/cn-project-status.enum';
import {CnExperimentsService} from './cn-experiments/cn-experiments.service';
import {CnReportsService} from './cn-reports/cn-reports.service';
import {CnExperiment, CnExperimentProtocol} from './cn-experiments/cn-experiment.entity';
import {CnCreateLabExperimentDto} from './cn-experiments/cn-experiment.dto';
import {CnCreateReportWithConfigDto} from './cn-reports/cn-report.dto';
import {CnReport} from './cn-reports/cn-report.entity';
import {IncomingMessage} from 'http';
import {CnErrorText} from '../cn-core/model/config/cn-error-text.class';
import {CnReportContent} from './cn-reports/cn-report-content.class';
import {CnLabConfig} from '../cn-lab-configs/cn-lab-config.entity';
import {CnProjectLevel, CnProjectLevelStatus} from './cn-projects/cn-project-level.enum';
import {
  CnProjectAncestorTreeDTO,
  CnProjectAncestorType,
  CnProjectDtoHelper,
  CnSaveProjectDTO
} from './cn-projects/cn-project.dto';
import {CnUser} from '../cn-users/cn-user.entity';
import {CmRichText, CmRichTextI, CmRichTextUploadedImage} from '@monorepo/common-model';
import {CnProjectComment} from '../cn-project-comment/cn-project-comment.entity';
import {CnProjectCommentService} from '../cn-project-comment/cn-project-comment.service';
import {CnNewComment} from '../cn-core/model/entities/cn-comment.entity';
import {CnGroupsAggregateService} from '../cn-groups/cn-groups-aggregate.service';
import {BlBadRequestException, BlFile, BlSearchParams, BlUnauthorizedException} from '@monorepo/back-core-lib';
import {DataSource} from 'typeorm';
import {CnCloudProviderRegion} from '../cn-cloud-providers/cn-cloud-provider-regions/cn-cloud-provider-region.entity';
import {CnBucket} from '../cn-object-storages/cn-buckets/cn-bucket.entity';
import {CnDocumentsService} from './cn-documents/cn-documents.service';
import {CnDocument} from './cn-documents/cn-document.entity';
import {CnConstellabDocument} from './cn-documents/cn-document-dto.class';
import {CnProjectBucketService} from './cn-project-bucket/cn-project-bucket.service';

@Injectable()
export class CnProjectAggregateService {

  protected readonly logger = new Logger(CnProjectAggregateService.name);

  constructor(private projectService: CnProjectsService,
              private projectSecurity: CnProjectsAggregateSecurity,
              private experimentService: CnExperimentsService,
              private reportService: CnReportsService,
              private groupAggregateService: CnGroupsAggregateService,
              private projectCommentService: CnProjectCommentService,
              private datasource: DataSource,
              private projectBucketService: CnProjectBucketService,
              private documentService: CnDocumentsService) {
  }

  /////////////////////////////////////// PROJECT //////////////////////////////////

  async createProject(projectDto: CnSaveProjectDTO): Promise<CnProject> {
    return this.datasource.transaction(async manager => {
      const entity = this.createProjectFromDTO(projectDto);

      entity.parent = null;
      entity.currentLevel = CnProjectLevel.PROJECT;
      entity.leader = CnCurrentUserHelper.getCurrentUser();
      const dbProject = await this.projectService.create(entity, manager);

      if (projectDto.storageRegion) {
        await this.projectBucketService.createProjectBucket(dbProject, projectDto.storageRegion, manager);
      }
      return dbProject;
    });
  }

  async createSubProject(projectDto: CnSaveProjectDTO, projectId: string): Promise<CnProject> {
    const entity = this.createProjectFromDTO(projectDto);
    entity.leader = CnCurrentUserHelper.getCurrentUser();

    const parentProject = await this.getAndCheckAuthorizationForUpdate(projectId);

    // check if parent can have children
    if (parentProject.levelStatus === CnProjectLevelStatus.LEAF) {
      throw new BlBadRequestException('Cannot create a sub project to a leaf project');
    }

    if (parentProject.currentLevel >= CnProjectLevel.TASK) {
      throw new BlBadRequestException('Cannot create project with a hierarchy level more than 3');
    }

    if (entity.endingDate && parentProject.endingDate && entity.endingDate > parentProject.endingDate) {
      throw new BlBadRequestException(CnErrorText.CHILD_PROJECT_END_DATA_AFTER_PARENT);
    }

    // set hierarchy info
    entity.parent = parentProject;
    entity.parentId = parentProject.id;
    entity.currentLevel = parentProject.currentLevel + 1;
    // if the project is level 3 force the status to leaf, otherwise set to undefined
    if (entity.currentLevel === CnProjectLevel.TASK) {
      entity.levelStatus = CnProjectLevelStatus.LEAF;
    }
    entity.rootParentId = parentProject.currentLevel === CnProjectLevel.PROJECT ? parentProject.id : parentProject.rootParentId;

    return await this.projectService.create(entity);
  }

  private createProjectFromDTO(projectDto: CnSaveProjectDTO): CnProject {
    const project = new CnProject();
    project.title = projectDto.title;
    project.code = projectDto.code;
    project.startingDate = projectDto.startingDate;
    project.endingDate = projectDto.endingDate;
    project.levelStatus = projectDto.levelStatus;
    return project;
  }

  async updateProject(id: string, entity: CnSaveProjectDTO): Promise<CnProject> {
    const dbProject = await this.getAndCheckAuthorizationForUpdate(id);

    // check that the ending date is not after the parent ending date
    if (entity.endingDate && dbProject.parentId) {
      const parent = await this.projectService.findByIdAndCheck(dbProject.parentId);
      if (parent.endingDate && entity.endingDate > parent.endingDate) {
        throw new BlBadRequestException(CnErrorText.CHILD_PROJECT_END_DATA_AFTER_PARENT);
      }
    }

    dbProject.title = entity.title;
    dbProject.code = entity.code;
    dbProject.startingDate = entity.startingDate;
    dbProject.endingDate = entity.endingDate;

    return this.projectService.update(dbProject);
  }

  async deleteProject(id: string): Promise<void> {
    const project = await this.getAndCheckAuthorizationForUpdate(id);


    const children = await this.projectService.getChildren(project.id);
    if (children.length > 0) {
      throw new BlBadRequestException(CnErrorText.DELETE_PROJECT_WITH_CHILDREN);
    }

    const experiments = await this.experimentService.getExperimentsByProject(project.id);
    if (experiments.length > 0) {
      throw new BlBadRequestException(CnErrorText.DELETE_PROJECT_WITH_EXPERIMENTS);
    }

    const reports = await this.reportService.getReportsByProject(project.id);
    if (reports.length > 0) {
      throw new BlBadRequestException(CnErrorText.DELETE_PROJECT_WITH_REPORTS);
    }

    const projectWithLab = await this.projectService.findByIdAndCheck(id, {labInstances: {labInstance: true}});
    if (projectWithLab.labInstances.length > 0) {
      const names = projectWithLab.labInstances.map(labProject => labProject.labInstance.name).join(', ');
      throw new BlBadRequestException(CnErrorText.DELETE_PROJECT_USED_IN_LAB,
        {detailArgs: {labNames: names}});
    }

    await this.datasource.transaction(async entityManager => {
      await this.projectService.deleteById(id, entityManager);
      await this.projectBucketService.deleteProjectBucket(id, entityManager);
    });
  }

  async findProject(id: string): Promise<CnProject> {
    return this.getAndCheckAuthorizationForFindOne(id);
  }

  public async getCurrentProjects(page: number, size: number): Promise<ClPageI<CnProject>> {
    return this.projectService.getCurrentProjects(page, size);
  }

  public async getByCurrentSpace(page: number, size: number): Promise<ClPageI<CnProject>> {
    const info = CnCurrentUserHelper.getAndCheckUserSpaceInfo();
    await this.projectSecurity.checkFindAllBySpace(info);
    return this.projectService.getBySpace(info.spaceId, page, size);
  }

  public async searchInCurrentSpace(searchParams: BlSearchParams, page: number, size: number): Promise<ClPageI<CnProject>> {
    const info = CnCurrentUserHelper.getAndCheckUserSpaceInfo();
    await this.projectSecurity.checkFindAllBySpace(info);
    return this.projectService.searchInSpace(info.spaceId, searchParams, page, size);
  }

  public async getProjectOfTeam(teamId: string, page: number, size: number): Promise<ClPageI<CnProject>> {
    // check if the user can view the group
    await this.groupAggregateService.getAndCheckTeamById(teamId);

    return this.projectService.getProjectsOfGroup(teamId, page, size);
  }

  public async getProjectTree(projectId: string): Promise<CnProject> {
    return this.getProjectObjectTree('project', projectId);
  }

  public async getProjectObjectTree(objectType: CnProjectAncestorType, objectId: string): Promise<CnProject> {
    let projectId: string;
    // retrieve the project id of the object
    switch (objectType) {
      case 'project':
        projectId = objectId;
        break;
      case 'experiment':
        const experiment = await this.experimentService.findByIdAndCheck(objectId);
        projectId = experiment.projectId;
        break;
      case 'report':
        const report = await this.reportService.findByIdAndCheck(objectId);
        projectId = report.projectId;
        break;
      case 'document':
        const document = await this.documentService.findByIdAndCheck(objectId);
        projectId = document.projectId;
        break;
    }

    const rootProject = await this.checkFindOneAndGetRootProject(projectId);

    return await this.projectService.getProjectTree(rootProject);
  }

  /**
   * Method not secured to get a list of project trees
   * @param projects
   */
  public async getProjectTrees(projects: CnProject[]): Promise<CnProject[]> {
    const rootProjects = projects.map(project => this.projectService.getProjectTree(project));
    return await Promise.all(rootProjects);
  }

  public async getChildren(projectId: string): Promise<CnProject[]> {
    const project = await this.getAndCheckAuthorizationForFindOne(projectId);

    return this.projectService.getChildren(project.id);
  }

  public async getObjectProjectAncestors(objectType: CnProjectAncestorType, objectId: string): Promise<CnProjectAncestorTreeDTO[]> {

    const ancestors: CnProjectAncestorTreeDTO[] = [];
    let projectId: string;
    switch (objectType) {
      case 'project':
        projectId = objectId;
        break;
      case 'experiment':
        const experiment = await this.experimentService.findByIdAndCheck(objectId);
        projectId = experiment.projectId;
        ancestors.push({type: 'experiment', id: experiment.id, title: experiment.title});
        break;
      case 'report':
        const report = await this.reportService.findByIdAndCheck(objectId);
        projectId = report.projectId;
        ancestors.push({type: 'report', id: report.id, title: report.title});
        break;
      case 'document':
        const doc = await this.documentService.findByIdAndCheck(objectId);
        projectId = doc.projectId;
        ancestors.push({type: 'document', id: doc.id, title: doc.name});
    }

    // retrieve the project ancestors
    const project = await this.findProject(projectId);
    const projectAncestors = await this.projectService.getAncestors(project);

    // Convert and add the project ancestors
    const projectDto: CnProjectAncestorTreeDTO[] = CnProjectDtoHelper.convertProjectAncestorTreeDtos(projectAncestors);
    ancestors.push(...projectDto);
    return ancestors;
  }

  public async updateProjectLeader(projectId: string, userId: string): Promise<CnProject> {
    const project = await this.projectService.findByIdAndCheck(projectId, {sharedGroups: true});
    const rootProject = await this.projectService.getRootProjectWithSharedGroup(project);

    // check if the current user has the authorization to update the leader
    await this.projectSecurity.checkUpdateProjectLeader(project, CnCurrentUserHelper.getAndCheckUserSpaceInfo());

    const leaderSingleGroup = await this.groupAggregateService.getUserSingleGroup(userId);

    return this.datasource.transaction(async (entityManager) => {

      // the group must be shared with the new leader single group
      // so if it is not shared, we add it
      if (!rootProject.isSharedToGroup(leaderSingleGroup.id)) {
        await this.projectService.shareProject(rootProject, leaderSingleGroup.id, entityManager);
      }

      // update the leader
      project.leader = leaderSingleGroup.user;
      return this.projectService.update(project, entityManager);
    });
  }

  /////////////////////////////////////// PROJECT DESCRIPTION //////////////////////////////////

  public async getDescription(projectId: string): Promise<CmRichTextI> {
    const project = await this.getAndCheckAuthorizationForFindOne(projectId);
    return project.description;
  }

  public async updateDescription(projectId: string, description: CmRichTextI): Promise<CnProject> {
    const project = await this.getAndCheckAuthorizationForUpdate(projectId);
    project.description = description;
    return this.projectService.update(project);
  }

  public async saveDescriptionImage(projectId: string, file: BlFile): Promise<CmRichTextUploadedImage> {
    const project = await this.getAndCheckAuthorizationForUpdate(projectId);
    return this.projectBucketService.saveDescriptionImage(project, file);
  }

  public async getDescriptionImage(projectId: string, filename: string): Promise<IncomingMessage> {
    const project = await this.getAndCheckAuthorizationForFindOne(projectId);

    return this.projectBucketService.getObject(project.getRootParentId(), filename);
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
      throw new BlBadRequestException(CnErrorText.EXP_MUST_BE_ASSOCIATED_WITH_LEAF_PROJECT);
    }

    await this.experimentService.saveLabExperiment(project, createLabExperimentDto);
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

  async createLabReport(createReportDto: CnCreateReportWithConfigDto, projectId: string,
                        files: BlFile[]): Promise<void> {
    const project = await this.getAndCheckAuthorizationForFindOne(projectId);

    if (project.levelStatus === CnProjectLevelStatus.PARENT) {
      throw new BlBadRequestException(CnErrorText.REPORT_MUST_BE_ASSOCIATED_WITH_LEAF_PROJECT);
    }

    // get and check all experiment
    const experiments: CnExperiment[] = [];
    for (const experimentId of createReportDto.experiment_ids) {
      const experiment: CnExperiment = await this.experimentService.findById(experimentId);

      if (experiment == null) {
        throw new BlBadRequestException('Can\'t create the report because one of the linked experiment could not be found');
      }

      if (experiment.projectId !== project.id) {
        throw new BlBadRequestException('Can\'t create the report because it is linked to an experiment of another project');
      }
      experiments.push(experiment);
    }

    const bucketConfig = await this.projectBucketService.getAndCheckProjectBucketConfig(project.getRootParentId());

    await this.reportService.createReport(createReportDto, experiments, project, bucketConfig, files);
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
    const report = await this.reportService.findByIdAndCheck(reportId);

    const project = await this.checkFindOneAndGetRootProject(report.projectId);

    // check that the filename is in the report
    const content = new CnReportContent(report.content);
    if (content.getFigureOp(filename) == null) {
      throw new BlUnauthorizedException();
    }
    return this.reportService.getImage(filename, project.getRootParentId());
  }

  async getReportView(reportId: string, filename: string): Promise<IncomingMessage> {
    const report = await this.reportService.findByIdAndCheck(reportId);

    const project = await this.checkFindOneAndGetRootProject(report.projectId);

    // check that the filename is in the report
    const content = new CnReportContent(report.content);
    if (content.getViewsOp(filename) == null) {
      throw new BlUnauthorizedException('The view is not in the report');
    }
    return this.reportService.getView(filename, project.getRootParentId());
  }

  /////////////////////////////////////// GROUPS //////////////////////////////////

  public async shareProject(projectId: string, groupId: string): Promise<CnGroup> {
    const project = await this.getAndCheckAuthorizationForUpdate(projectId);

    if (project.currentLevel !== CnProjectLevel.PROJECT) {
      throw new BlBadRequestException('Only root projects can be shared');
    }

    return this.projectService.shareProject(project, groupId);
  }

  public async unshareProject(projectId: string, groupId: string): Promise<void> {
    const project = await this.getAndCheckAuthorizationForUpdate(projectId);

    if (project.sharedGroups.length <= 1) {
      throw new BlBadRequestException(CnErrorText.PROJECT_MUST_HAVE_A_GROUP);
    }

    // forbid to unshare the single user group of the leader
    // this is to unsure the leader will always have access to the project
    const group = await this.groupAggregateService.findByIdAndCheck(groupId);
    if (group instanceof CnGroupSingleUser && group.userId === project.leader.id) {
      throw new BlBadRequestException(CnErrorText.CANT_UNSHARED_PROJECT_LEADER_GROUP);
    }

    return this.projectService.unshareProject(project, groupId);
  }

  /**
   * Return the list of shared group for tha root project
   * @param projectId
   */
  public async getProjectSharedGroups(projectId: string): Promise<CnGroup[]> {
    const rootProject = await this.checkFindOneAndGetRootProject(projectId);
    return rootProject.sharedGroups;
  }

  /**
   * Return the complete list of user that have access to the project
   * @param id
   */
  public async getUsersOfProject(id: string): Promise<CnUser[]> {
    const groups = await this.getProjectSharedGroups(id);

    // get the group of the root project then the user
    const groupIds = groups.map(group => group.id);
    return this.groupAggregateService.getUsersOfGroups(groupIds);
  }

  /////////////////////////////////////// PROJECT COMMENT //////////////////////////////////

  public async updateProjectComment(projectId: string, comment: string, content: CmRichTextI): Promise<CnProjectComment> {
    return this.projectCommentService.updateComment(projectId, comment, content);
  }

  public async createProjectComment(newComment: CnNewComment, projectId: string): Promise<CnProjectComment> {
    const project = await this.projectService.findById(projectId);

    const userMentions: CnUser[] = await this.getUserMentions(projectId, newComment.content);

    return this.projectCommentService.create(newComment, project, userMentions);
  }

  public async getProjectComments(projectId: string, page: number, size: number): Promise<ClPage<CnProjectComment>> {
    return this.projectCommentService.getProjectComments(projectId, page, size);
  }

  public async deleteProjectComment(projectId: string, commentId: string): Promise<void> {
    return this.projectCommentService.delete(commentId, projectId);
  }

  public async saveCommentImage(file: BlFile, projectId: string): Promise<CmRichTextUploadedImage> {
    const rootProject = await this.getAndCheckAuthorizationForFindOne(projectId);

    const bucketConfig = await this.projectBucketService.getAndCheckProjectBucketConfig(rootProject.id);
    return this.projectCommentService.saveProjectCommentImage(file, bucketConfig, projectId);
  }

  public async getCommentImage(filename: string, projectId: string): Promise<IncomingMessage> {
    const rootProject = await this.getAndCheckAuthorizationForFindOne(projectId);

    const bucketConfig = await this.projectBucketService.getAndCheckProjectBucketConfig(rootProject.id);
    return await this.projectCommentService.getImage(filename, bucketConfig);
  }

  /////////////////////////////////////// DOCUMENT //////////////////////////////////

  public async uploadDocument(projectId: string, file: BlFile): Promise<CnDocument> {
    const project = await this.getAndCheckAuthorizationForFindOne(projectId);

    return this.documentService.uploadDocument(file, project);
  }

  public async getDocument(projectId: string, filename: string): Promise<IncomingMessage> {
    const project = await this.getAndCheckAuthorizationForFindOne(projectId);

    const document = await this.documentService.findDocumentByProjectAndName(projectId, filename);

    if (document == null) {
      throw new BlBadRequestException('Document not found');
    }
    if (document.projectId != projectId) {
      throw new BlUnauthorizedException();
    }

    return this.documentService.getDocument(project, document.filePath);
  }

  public async deleteDocument(documentId: string): Promise<void> {
    const document = await this.documentService.findByIdAndCheck(documentId);

    const project = await this.getAndCheckAuthorizationForFindOne(document.projectId);

    return this.documentService.deleteDocument(documentId, project);
  }

  public async getDocumentsByProject(projectId: string, page: number, size: number): Promise<ClPage<CnDocument>> {
    await this.getAndCheckAuthorizationForFindOne(projectId);

    return this.documentService.getDocumentsByProject(projectId, page, size);
  }

  public async renameDocument(documentId: string, newName: string): Promise<CnDocument> {
    const document = await this.documentService.findByIdAndCheck(documentId);

    await this.getAndCheckAuthorizationForFindOne(document.projectId);

    return this.documentService.renameDocument(document, newName);
  }

  ////////////////////////////////////////////// CONSTELLAB DOCUMENTS //////////////////////////////////////////////
  public async createConstellabDocument(projectId: string, filename: string): Promise<CnConstellabDocument> {
    const project = await this.getAndCheckAuthorizationForFindOne(projectId);

    return this.documentService.createConstellabDocument(project, filename);
  }

  public async updateConstellabDocument(documentId: string, content: CmRichTextI): Promise<CnConstellabDocument> {
    const document = await this.documentService.findByIdAndCheck(documentId);

    const project = await this.getAndCheckAuthorizationForFindOne(document.projectId);

    return this.documentService.updateConstellabDocument(project, document, content);
  }

  public async getConstellabDocument(documentId: string): Promise<CnConstellabDocument> {
    const document = await this.documentService.findByIdAndCheck(documentId);

    const project = await this.getAndCheckAuthorizationForFindOne(document.projectId);

    return this.documentService.getConstellabDocument(project, document);
  }

  public async uploadImageToConstellabDocument(documentId: string, file: BlFile): Promise<CmRichTextUploadedImage> {
    const document = await this.documentService.findByIdAndCheck(documentId);

    const project = await this.getAndCheckAuthorizationForFindOne(document.projectId);

    return this.documentService.uploadImageToConstellabDocument(project, document, file);
  }

  public async getConstellabDocumentImage(documentId: string, filepath: string): Promise<IncomingMessage> {
    const document = await this.documentService.findByIdAndCheck(documentId);

    const project = await this.getAndCheckAuthorizationForFindOne(document.projectId);

    return this.documentService.getImageFromConstellabDocument(project, filepath);
  }


  /////////////////////////////////////// PROJECT BUCKET //////////////////////////////////
  public async createProjectBucket(projectId: string, region: CnCloudProviderRegion): Promise<CnBucket> {
    const project = await this.getAndCheckAuthorizationForUpdate(projectId);

    if (project.currentLevel !== CnProjectLevel.PROJECT) {
      throw new BlBadRequestException('Only root projects can have a bucket');
    }

    return this.projectBucketService.createProjectBucket(project, region);
  }

  public async getProjectBucket(projectId: string): Promise<CnBucket> {
    const project = await this.getAndCheckAuthorizationForUpdate(projectId);

    if (project.currentLevel !== CnProjectLevel.PROJECT) {
      throw new BlBadRequestException('Only root projects can have a bucket');
    }

    return this.projectBucketService.getProjectBucket(projectId);
  }

  /////////////////////////////////////// SECURITY //////////////////////////////////


  private async getAndCheckAuthorizationForFindOne(projectId: string): Promise<CnProject> {
    const dbProject = await this.projectService.findWithSharedGroups(projectId);

    await this.projectSecurity.checkFindOne(dbProject, CnCurrentUserHelper.getAndCheckUserSpaceInfo());
    return dbProject;
  }

  private async getAndCheckAuthorizationForUpdate(projectId: string): Promise<CnProject> {
    const dbProject = await this.projectService.findWithSharedGroups(projectId);

    await this.projectSecurity.checkUpdate(dbProject, CnCurrentUserHelper.getAndCheckUserSpaceInfo());
    return dbProject;
  }

  private async checkFindOneAndGetRootProject(projectId: string): Promise<CnProject> {
    const project = await this.projectService.findWithSharedGroups(projectId);

    return await this.projectSecurity.checkFindOneAndGetRootProject(project, CnCurrentUserHelper.getAndCheckUserSpaceInfo());
  }

  private async getUserMentions(projectId: string, content: CmRichTextI): Promise<CnUser[]> {
    const userMentions: CnUser[] = [];
    const mentions: string[] = CmRichText.getMentions(content);
    if (mentions.length > 0) {
      for (const m of mentions) {
        if (m == '0') {
          const users = await this.getUsersOfProject(projectId);
          for (const u of users) {
            if (!userMentions.find(um => um.id == u.id) && u.id != CnCurrentUserHelper.getCurrentUser().id) // avoid duplicate
              userMentions.push(u);
          }
        } else {
          const user = (await this.getUsersOfProject(projectId)).find(u => u.id == m);
          if (!userMentions.find(um => um.id == user.id) && user.id != CnCurrentUserHelper.getCurrentUser().id) // avoid duplicate
            userMentions.push(user);
        }
      }
    }
    return userMentions;
  }

}
