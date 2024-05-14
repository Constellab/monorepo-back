import {Injectable, Logger, UnauthorizedException} from '@nestjs/common';
import {CnProjectsService} from './cn-projects/cn-projects.service';
import {CnProjectsAggregateSecurity} from './cn-projects-aggregate.security';
import {CnProject} from './cn-projects/cn-project.entity';
import {CnCurrentUserHelper} from '../cn-core/utils/cn-current-user.helper';
import {ClHelpService, ClPage, ClPageI} from '@monorepo/core-lib';
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
import {CnLabConfig} from '../cn-lab-configs/cn-lab-config.entity';
import {CnProjectLevel, CnProjectLevelStatus} from './cn-projects/cn-project-level.enum';
import {
  CnProjectAncestorTreeDTO,
  CnProjectAncestorType,
  CnProjectDtoHelper,
  CnProjectStorageLocationDTO,
  CnSaveProjectDTO
} from './cn-projects/cn-project.dto';
import {CnUser} from '../cn-users/cn-user.entity';
import {CnProjectComment, getFakeUserEveryoneMention} from '../cn-project-comment/cn-project-comment.entity';
import {CnProjectCommentService} from '../cn-project-comment/cn-project-comment.service';
import {CnNewCommentDTO} from '../cn-core/model/entities/cn-comment.entity';
import {
  BlBadRequestException,
  BlFile,
  BlQuillMigrator,
  BlRichTextContent,
  BlRichTextUploadedImage,
  BlSearchBuilder,
  BlSearchParams,
  BlUnauthorizedException
} from '@monorepo/back-core-lib';
import {DataSource, In} from 'typeorm';
import {CnProjectBucketService} from './cn-projects/cn-project-bucket.service';
import {CnProjectUserService} from './cn-project-user/cn-project-user.service';
import {CnUsersService} from '../cn-users/cn-users.service';
import {CnProjectUser} from './cn-project-user/cn-project-user.entity';
import {CnProjectEvent, cnProjectEventName, CnProjectEventType} from './cn-project.event';
import {EventEmitter2} from '@nestjs/event-emitter';
import {CnActivity, CnActivityEntityType} from '../cn-activity/cn-activity.entity';
import {CnActivityService} from '../cn-activity/cn-activity.service';
import {CnBucketLocationDTO} from '../cn-object-storages/cn-buckets/cn-bucket.entity';
import {CnProjectDocumentService} from './cn-project-documents/cn-project-document.service';
import {CnProjectDocument, CnProjectDocumentType} from './cn-project-documents/cn-project-document.entity';
import {CnConstellabDocumentDTO, CnProjectStorageUsageDTO} from './cn-project-documents/cn-project-document-dto.class';

@Injectable()
export class CnProjectAggregateService {

  protected readonly logger = new Logger(CnProjectAggregateService.name);

  constructor(private projectService: CnProjectsService,
              private projectSecurity: CnProjectsAggregateSecurity,
              private experimentService: CnExperimentsService,
              private reportService: CnReportsService,
              private projectCommentService: CnProjectCommentService,
              private datasource: DataSource,
              private projectBucketService: CnProjectBucketService,
              private projectDocumentService: CnProjectDocumentService,
              private projectUserService: CnProjectUserService,
              private userService: CnUsersService,
              private eventEmitter: EventEmitter2,
              private activityService: CnActivityService) {
  }

  /////////////////////////////////////// PROJECT //////////////////////////////////

  async createProject(projectDto: CnSaveProjectDTO): Promise<CnProject> {
    const newProject = await this.datasource.transaction(async manager => {
      const entity = this.createProjectFromDTO(projectDto);

      entity.parent = null;
      entity.currentLevel = CnProjectLevel.PROJECT;
      entity.leader = CnCurrentUserHelper.getAndCheckCurrentUser();
      entity.mainStorage = await this.projectBucketService.getBucketById(projectDto.mainStorage.bucketId);

      if (projectDto.backupStorage) {
        entity.backupStorage = await this.projectBucketService.getBucketById(projectDto.backupStorage.bucketId);

        if (entity.mainStorage.bucketType !== entity.backupStorage.bucketType) {
          throw new BlBadRequestException('Main and backup storage must have the same type (cloud or lab)');
        }
      }
      const dbProject = await this.projectService.create(entity, manager);

      // share the project with the leader
      await this.projectUserService.shareProjectToUserIfNot(dbProject.id, dbProject.leader.id, manager);

      return dbProject;
    });

    this.emitProjectEvent('CREATE_PROJECT', newProject, newProject);
    return newProject;
  }

  async createSubProject(projectDto: CnSaveProjectDTO, projectId: string): Promise<CnProject> {
    const entity = this.createProjectFromDTO(projectDto);
    entity.leader = CnCurrentUserHelper.getAndCheckCurrentUser();

    const parentProject = await this.getAndCheckAuthorizationForUpdate(projectId);

    // check if parent can have children
    if (parentProject.levelStatus === CnProjectLevelStatus.LEAF) {
      throw new BlBadRequestException('Cannot create a sub project to a leaf project');
    }

    if (parentProject.currentLevel >= CnProjectLevel.MAX_LEVEL) {
      throw new BlBadRequestException(`Cannot create project with a hierarchy level more than ${CnProjectLevel.MAX_LEVEL}`);
    }

    if (entity.endingDate && parentProject.endingDate && entity.endingDate > parentProject.endingDate) {
      throw new BlBadRequestException(CnErrorText.CHILD_PROJECT_END_DATA_AFTER_PARENT);
    }

    // set hierarchy info
    entity.parent = parentProject;
    entity.parentId = parentProject.id;
    entity.currentLevel = parentProject.currentLevel + 1;
    // if the project is level max force the status to leaf
    if (entity.currentLevel === CnProjectLevel.MAX_LEVEL) {
      entity.levelStatus = CnProjectLevelStatus.LEAF;
    }
    entity.rootParentId = parentProject.currentLevel === CnProjectLevel.PROJECT ? parentProject.id : parentProject.rootParentId;

    const newProject = await this.projectService.create(entity);
    this.emitProjectEvent('CREATE_SUB_PROJECT', parentProject, newProject);
    return newProject;
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

    const newProject = await this.projectService.update(dbProject);
    this.emitProjectEvent('UPDATE_PROJECT', newProject, newProject);
    return newProject;
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

    const documents = await this.projectDocumentService.getProjectDocuments(project.id, false, 0, 1);
    if (documents.totalElements > 0) {
      throw new BlBadRequestException(CnErrorText.DELETE_PROJECT_WITH_DOCUMENTS);
    }

    const projectWithLab = await this.projectService.findByIdAndCheck(id, {labInstances: {labInstance: true}});
    if (projectWithLab.labInstances.length > 0) {
      const names = projectWithLab.labInstances.map(labProject => labProject.labInstance.name).join(', ');
      throw new BlBadRequestException(CnErrorText.DELETE_PROJECT_USED_IN_LAB,
        {detailArgs: {labNames: names}});
    }


    await this.datasource.transaction(async entityManager => {
      const documents = await this.projectDocumentService.findDocumentsByProject(project.id);
      for (const document of documents) {
        await this.projectDocumentService.deleteDocument(document.id, entityManager);
      }

      await this.projectService.deleteById(id, entityManager);
    });

    this.emitProjectEvent('DELETE_PROJECT', project, project);
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
        const document = await this.projectDocumentService.findByIdAndCheck(objectId);
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
        const doc = await this.projectDocumentService.findByIdAndCheck(objectId);
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
    const project = await this.projectService.findByIdAndCheck(projectId);
    const rootProject = await this.projectService.getRootProject(project);

    // check if the current user has the authorization to update the leader
    await this.projectSecurity.checkUpdateProjectLeader(project, CnCurrentUserHelper.getAndCheckUserSpaceInfo());

    const newLeader = await this.userService.findByIdAndCheck(userId);
    const newProject = await this.datasource.transaction(async (entityManager) => {

      // the group must be shared with the new leader single group
      // so if it is not shared, we add it
      await this.projectUserService.shareProjectToUserIfNot(rootProject.id, userId, entityManager);

      // update the leader
      project.leader = newLeader;
      return this.projectService.update(project, entityManager);
    });

    this.emitProjectEvent('UPDATE_PROJECT_LEADER', newProject, newProject);
    return newProject;
  }

  /////////////////////////////////////// PROJECT DESCRIPTION //////////////////////////////////

  public async getDescription(projectId: string): Promise<BlRichTextContent> {
    const project = await this.getAndCheckAuthorizationForFindOne(projectId);
    return project.description;
  }

  public async updateDescription(projectId: string, description: BlRichTextContent): Promise<CnProject> {
    const project = await this.getAndCheckAuthorizationForUpdate(projectId);
    project.description = description;
    const newProject = await this.projectService.update(project);

    this.emitProjectEvent('UPDATE_PROJECT_DESCRIPTION', newProject, newProject);
    return newProject;
  }

  public async saveDescriptionImage(projectId: string, file: BlFile): Promise<BlRichTextUploadedImage> {
    const project = await this.getAndCheckAuthorizationForUpdate(projectId);

    return this.projectDocumentService.uploadImageDocument(file, project, CnProjectDocumentType.DESCRIPTION_CONTENT,
      project.id);
  }

  public async getDescriptionImage(projectId: string, filename: string): Promise<IncomingMessage> {
    const project = await this.getAndCheckAuthorizationForFindOne(projectId);

    return this.projectDocumentService.getDocumentContentByTypeAndName(project, CnProjectDocumentType.DESCRIPTION_CONTENT,
      filename, projectId);
  }

  /////////////////////////////////////// PROJECT STATUS //////////////////////////////////


  async updateProjectCurrentStatus(status: CnProjectStatus, id: string): Promise<CnProject> {
    const project = await this.getAndCheckAuthorizationForUpdate(id);

    const newProject = await this.projectService.updateCurrentStatusWithDbEntity(status, project);
    this.emitProjectEvent('UPDATE_PROJECT_STATUS', newProject, newProject);
    return newProject;
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
    // check that the user can get the project
    const project = await this.getAndCheckAuthorizationForFindOne(projectId);

    if (project.levelStatus === CnProjectLevelStatus.PARENT) {
      throw new BlBadRequestException(CnErrorText.EXP_MUST_BE_ASSOCIATED_WITH_LEAF_PROJECT);
    }

    const result = await this.experimentService.saveLabExperiment(project, createLabExperimentDto);

    if (result.mode === 'create') {
      this.emitProjectEvent('CREATE_EXPERIMENT', project, result.experiment);
    } else {
      this.emitProjectEvent('UPDATE_EXPERIMENT', project, result.experiment);
    }
  }

  async deleteLabExperiment(projectId: string, experimentId: string): Promise<void> {
    // check that the user can get the project
    await this.getAndCheckAuthorizationForFindOne(projectId);

    const experiment = await this.experimentService.deleteExperiment(experimentId);
    if (experiment) {
      this.emitProjectEvent('DELETE_EXPERIMENT', experiment.project, experiment);
    }
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

  public async findReportContent(id: string): Promise<BlRichTextContent> {
    const report = await this.reportService.findByIdAndCheck(id);

    const project = await this.getAndCheckAuthorizationForFindOne(report.projectId);
    return this.reportService.getReportContent(project, report.id);
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

    const reportResult = await this.reportService.saveReport(createReportDto, experiments, project, files);

    if (reportResult.mode === 'create') {
      this.emitProjectEvent('CREATE_REPORT', project, reportResult.report);
    } else {
      this.emitProjectEvent('UPDATE_REPORT', project, reportResult.report);
    }
  }

  async deleteReportFromLab(projectId: string, reportId: string): Promise<void> {
    // check that the user can get the project
    const project = await this.getAndCheckAuthorizationForFindOne(projectId);

    const report = await this.reportService.deleteReport(reportId);

    if (report) {
      this.emitProjectEvent('DELETE_REPORT', project, report);
    }
  }

  async deleteReport(reportId: string): Promise<void> {
    // for now, only admin can delete report directly
    if (!CnCurrentUserHelper.isAdmin()) {
      throw new UnauthorizedException();
    }
    const report = await this.reportService.findByIdAndCheck(reportId);
    const project = await this.getAndCheckAuthorizationForFindOne(report.projectId);

    await this.reportService.deleteReport(reportId);
    this.emitProjectEvent('DELETE_REPORT', project, report);
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

    const project = await this.getAndCheckAuthorizationForFindOne(report.projectId);
    return this.reportService.getImage(filename, project, reportId);
  }

  async getReportView(reportId: string, viewId: string): Promise<IncomingMessage> {
    const report = await this.reportService.findByIdAndCheck(reportId);

    const project = await this.getAndCheckAuthorizationForFindOne(report.projectId);
    return this.reportService.getView(viewId, project, reportId);
  }

  /////////////////////////////////////// GROUPS //////////////////////////////////

  public async shareProject(projectId: string, groupId: string): Promise<CnUser[]> {
    const project = await this.getAndCheckAuthorizationForUpdate(projectId);

    if (project.currentLevel !== CnProjectLevel.PROJECT) {
      throw new BlBadRequestException('Only root projects can be shared');
    }

    const newUsers = await this.projectUserService.shareProjectToGroup(project.id, groupId);

    this.emitProjectEvent('SHARE_PROJECT', project, newUsers);

    return this.projectUserService.findUsersByProjectId(projectId);
  }

  public async unshareProject(projectId: string, userId: string): Promise<void> {
    const project = await this.getAndCheckAuthorizationForUpdate(projectId);


    // forbid to unshare the single user group of the leader
    // this is to unsure the leader will always have access to the project
    if (userId === project.leader.id) {
      throw new BlBadRequestException(CnErrorText.CANT_UNSHARED_PROJECT_LEADER_GROUP);
    }

    const user = await this.userService.findByIdAndCheck(userId);
    await this.projectUserService.unshareProjectFromUser(project.id, userId);

    this.emitProjectEvent('UNSHARE_PROJECT', project, user);
  }

  /**
   * Return the complete list of user that have access to the project
   * @param id
   */
  public async getUsersOfProject(id: string): Promise<CnUser[]> {
    const rootProject = await this.checkFindOneAndGetRootProject(id);

    return this.projectUserService.findUsersByProjectId(rootProject.id);
  }

  public async searchProjectUsersByName(projectId: string, name: string, page: number, size: number): Promise<ClPage<CnUser>> {
    const rootProject = await this.checkFindOneAndGetRootProject(projectId);

    const result = await this.projectUserService.smartSearchByName(rootProject.id, name, page, size);
    const users = result.map(user => user.user);

    if (ClHelpService.isNullOrEmpty(name)) {
      users.objects.unshift(getFakeUserEveryoneMention());
    }

    return users;
  }


  /////////////////////////////////////// PROJECT COMMENT //////////////////////////////////

  public async createProjectComment(newComment: CnNewCommentDTO, projectId: string): Promise<CnProjectComment> {
    const project = await this.getAndCheckAuthorizationForFindOne(projectId);

    const comment = await this.projectCommentService.createComment(newComment, project);

    this.emitProjectEvent('CREATE_PROJECT_COMMENT', project, comment);
    return comment;
  }

  public async updateProjectComment(projectId: string, commentId: string, content: BlRichTextContent): Promise<CnProjectComment> {
    const project = await this.getAndCheckAuthorizationForFindOne(projectId);

    const comment = await this.projectCommentService.findByIdAndCheck(commentId);
    if (comment.createdBy.id != CnCurrentUserHelper.getCurrentUser().id) {
      throw new UnauthorizedException();
    }

    const newComment = await this.projectCommentService.updateComment(comment, content);
    this.emitProjectEvent('UPDATE_PROJECT_COMMENT', project, comment);
    return newComment;
  }

  public async deleteProjectComment(projectId: string, commentId: string): Promise<void> {
    const project = await this.getAndCheckAuthorizationForFindOne(projectId);

    const comment = await this.projectCommentService.findByIdAndCheck(commentId);
    if (comment.createdBy.id != CnCurrentUserHelper.getCurrentUser().id) {
      throw new UnauthorizedException();
    }

    await this.projectCommentService.deleteComment(comment, projectId);
    this.emitProjectEvent('DELETE_PROJECT_COMMENT', project, comment);

  }

  public async getProjectComments(projectId: string, page: number, size: number): Promise<ClPage<CnProjectComment>> {
    await this.getAndCheckAuthorizationForFindOne(projectId);
    return this.projectCommentService.getProjectComments(projectId, page, size);
  }

  public async saveCommentImage(file: BlFile, projectId: string): Promise<BlRichTextUploadedImage> {
    const project = await this.getAndCheckAuthorizationForFindOne(projectId);
    return this.projectCommentService.saveProjectCommentImage(file, project);
  }

  public async getCommentImage(filename: string, projectId: string): Promise<IncomingMessage> {
    const project = await this.getAndCheckAuthorizationForFindOne(projectId);
    return await this.projectCommentService.getCommentImage(project, filename);
  }

  /////////////////////////////////////// DOCUMENT //////////////////////////////////

  public async uploadDocument(projectId: string, file: BlFile): Promise<CnProjectDocument> {
    const project = await this.getAndCheckAuthorizationForFindOne(projectId);

    const doc = await this.projectDocumentService.uploadDocument(file, project,
      CnProjectDocumentType.UPLOADED_DOCUMENT, project.id, file.originalname);

    this.emitProjectEvent('UPLOAD_PROJECT_DOCUMENT', project, doc);

    return doc;
  }

  public async getUploadedDocument(projectId: string, documentName: string): Promise<IncomingMessage> {
    const project = await this.getAndCheckAuthorizationForFindOne(projectId);

    return await this.projectDocumentService.getDocumentContentByTypeAndName(project,
      CnProjectDocumentType.UPLOADED_DOCUMENT, documentName, projectId);
  }

  public async deleteDocument(documentId: string): Promise<void> {
    const document = await this.projectDocumentService.findByIdAndCheck(documentId);

    const project = await this.getAndCheckAuthorizationForFindOne(document.projectId);

    await this.datasource.transaction(async entityManager => {
      await this.projectDocumentService.deleteDocument(documentId, entityManager);
    });

    this.emitProjectEvent('DELETE_PROJECT_DOCUMENT', project, document);
  }

  public async moveDocumentToTrash(documentId: string): Promise<CnProjectDocument> {
    const document = await this.projectDocumentService.findByIdAndCheck(documentId);

    const project = await this.getAndCheckAuthorizationForFindOne(document.projectId);

    const doc = await this.projectDocumentService.moveToTrash(document);

    this.emitProjectEvent('MOVE_PROJECT_DOCUMENT_TO_TRASH', project, document);

    return doc;
  }

  public async restoreDocumentFromTrash(documentId: string): Promise<CnProjectDocument> {
    const document = await this.projectDocumentService.findByIdAndCheck(documentId);

    const project = await this.getAndCheckAuthorizationForFindOne(document.projectId);

    const doc = await this.projectDocumentService.restoreFromTrash(document);

    this.emitProjectEvent('RESTORE_PROJECT_DOCUMENT_FROM_TRASH', project, document);

    return doc;
  }

  public async emptyTrash(projectId: string): Promise<void> {
    const project = await this.getAndCheckAuthorizationForFindOne(projectId);

    await this.projectDocumentService.emptyProjectTrash(project.id);
  }

  public async getDocumentsByProject(projectId: string, inTrash: boolean, page: number, size: number): Promise<ClPage<CnProjectDocument>> {
    await this.getAndCheckAuthorizationForFindOne(projectId);

    return this.projectDocumentService.getProjectDocuments(projectId, inTrash, page, size);
  }

  public async renameDocument(documentId: string, newName: string): Promise<CnProjectDocument> {
    const document = await this.projectDocumentService.findByIdAndCheck(documentId);

    await this.getAndCheckAuthorizationForFindOne(document.projectId);

    return this.projectDocumentService.renameDocument(document, newName);
  }

  ////////////////////////////////////////////// CONSTELLAB DOCUMENTS //////////////////////////////////////////////
  public async createConstellabDocument(projectId: string, filename: string): Promise<CnConstellabDocumentDTO> {
    const project = await this.getAndCheckAuthorizationForFindOne(projectId);

    const doc = await this.projectDocumentService.createConstellabDocument(project, filename);
    this.emitProjectEvent('CREATE_CONSTELLAB_DOCUMENT', project, doc.document);
    return doc;
  }

  public async updateConstellabDocument(documentId: string, content: BlRichTextContent): Promise<CnConstellabDocumentDTO> {
    const document = await this.projectDocumentService.findByIdAndCheck(documentId);

    const project = await this.getAndCheckAuthorizationForFindOne(document.projectId);

    const newDoc = await this.projectDocumentService.updateConstellabDocument(project, document, content);

    this.emitProjectEvent('UPDATE_CONSTELLAB_DOCUMENT', project, newDoc);
    return newDoc;
  }

  public async getConstellabDocument(documentId: string): Promise<CnConstellabDocumentDTO> {
    const document = await this.projectDocumentService.findByIdAndCheck(documentId);

    const project = await this.getAndCheckAuthorizationForFindOne(document.projectId);

    return this.projectDocumentService.getConstellabDocument(project, document);
  }

  public async uploadImageToConstellabDocument(documentId: string, file: BlFile): Promise<BlRichTextUploadedImage> {
    const document = await this.projectDocumentService.findByIdAndCheck(documentId);

    const project = await this.getAndCheckAuthorizationForFindOne(document.projectId);

    return this.projectDocumentService.uploadImageToConstellabDocument(project, document, file);
  }

  public async getConstellabDocumentImage(documentId: string, documentName: string): Promise<IncomingMessage> {
    const document = await this.projectDocumentService.findByIdAndCheck(documentId);

    const project = await this.getAndCheckAuthorizationForFindOne(document.projectId);

    return this.projectDocumentService.getDocumentContentByTypeAndName(project,
      CnProjectDocumentType.CONSTELLAB_DOCUMENT_CONTENT, documentName, documentId);
  }


  /////////////////////////////////////// PROJECT BUCKET //////////////////////////////////

  public async createProjectBucket(projectId: string, projectStorageDTO: CnProjectStorageLocationDTO)
    : Promise<CnProjectStorageLocationDTO> {
    await this.getProjectAndCheckForBucketUpdate(projectId);

    const projectWithStorage = await this.projectBucketService.findProjectWithStorageById(projectId);

    if (projectWithStorage.mainStorage && projectWithStorage.backupStorage) {
      throw new BlBadRequestException('The project storage regions are already defined');
    }

    if (projectWithStorage.mainStorage == null && projectStorageDTO.mainStorage) {
      projectWithStorage.mainStorage = await this.projectBucketService.getBucketById(projectStorageDTO.mainStorage.bucketId);
    }

    if (projectWithStorage.backupStorage == null && projectStorageDTO.backupStorage) {
      projectWithStorage.backupStorage = await this.projectBucketService.getBucketById(projectStorageDTO.backupStorage.bucketId);
    }

    await this.projectService.update(projectWithStorage);

    return {
      mainStorage: projectWithStorage.mainStorage?.getBucketLocation() ?? null,
      backupStorage: projectWithStorage.backupStorage?.getBucketLocation() ?? null
    };
  }

  public async getProjectStorage(projectId: string): Promise<CnProjectStorageLocationDTO> {
    await this.getProjectAndCheckForBucketUpdate(projectId);

    const buckets = await this.projectBucketService.getProjectBucket(projectId);

    // return only region to the user, he doesn't need the bucket name
    return {
      mainStorage: buckets.mainStorage?.getBucketLocation() ?? null,
      backupStorage: buckets.backupStorage?.getBucketLocation() ?? null
    };
  }

  public async findAccessibleProjectBucketLocation(page: number, size: number): Promise<ClPage<CnBucketLocationDTO>> {
    const info = CnCurrentUserHelper.getAndCheckUserSpaceInfo();
    return this.projectBucketService.findAccessibleProjectBucketLocation(info.spaceId, page, size);
  }

  private async getProjectAndCheckForBucketUpdate(projectId: string): Promise<CnProject> {
    const project = await this.getAndCheckAuthorizationForUpdate(projectId);

    if (project.currentLevel !== CnProjectLevel.PROJECT) {
      throw new BlBadRequestException('Only root projects can have a bucket');
    }

    return project;
  }

  public async getStorageSizeByProjects(projectId: string): Promise<CnProjectStorageUsageDTO> {
    await this.getAndCheckAuthorizationForFindOne(projectId);

    const children = await this.getChildren(projectId);

    return this.projectDocumentService.getStorageSizeDetailByProjects([projectId, ...children.map(project => project.id)]);

  }

  /////////////////////////////////////// PROJECT USER //////////////////////////////////
  public async getCurrentProjectUserConfig(projectId: string): Promise<CnProjectUser> {
    await this.getAndCheckAuthorizationForFindOne(projectId);

    return this.projectUserService.findByProjectIdAndUserId(projectId, CnCurrentUserHelper.getAndCheckCurrentUser().id);
  }

  public async updateCurrentProjectUserConfig(projectId: string, options: CnProjectUser): Promise<CnProjectUser> {
    await this.getAndCheckAuthorizationForFindOne(projectId);

    options.projectId = projectId;
    options.userId = CnCurrentUserHelper.getAndCheckCurrentUser().id;

    return this.projectUserService.updateProjectUser(options);
  }

  /////////////////////////////////////// ACTIVITY //////////////////////////////////

  public async searchProjectActivity(projectId: string, searchParam: BlSearchParams,
                                     page: number, size: number): Promise<ClPage<CnActivity>> {
    // check that the user can view the project
    const project = await this.getAndCheckAuthorizationForFindOne(projectId);

    const searchBuilder = new BlSearchBuilder<CnActivity>({createdAt: 'DESC' as any});

    if (searchParam.hasFilter('includeSubProjects')) {
      const allProjects = await this.projectService.getProjectTreeAsList(project);
      const allProjectIds = allProjects.map(project => project.id);
      searchBuilder.mergeWhereOptions({
        parentEntityId: In(allProjectIds),
      });
      searchParam.removeFilter('includeSubProjects');
    } else {
      searchBuilder.mergeWhereOptions({
        parentEntityId: projectId,
      });
    }

    searchBuilder.addSearchParams(searchParam);

    // add filter on entity type if not already present
    if (!searchBuilder.hasWhereOptions('entityType')) {
      searchBuilder.mergeWhereOptions({
        entityType: In([CnActivityEntityType.PROJECT, CnActivityEntityType.PROJECT_COMMENT,
          CnActivityEntityType.REPORT, CnActivityEntityType.EXPERIMENT, CnActivityEntityType.PROJECT_DOCUMENT])
      });
    }


    return await this.activityService.search(searchBuilder.build(), page, size);
  }

  /////////////////////////////////////// SECURITY //////////////////////////////////


  private async getAndCheckAuthorizationForFindOne(projectId: string): Promise<CnProject> {
    const dbProject = await this.projectService.findByIdAndCheck(projectId);

    await this.projectSecurity.checkFindOne(dbProject, CnCurrentUserHelper.getAndCheckUserSpaceInfo());
    return dbProject;
  }

  private async getAndCheckAuthorizationForUpdate(projectId: string): Promise<CnProject> {
    const dbProject = await this.projectService.findByIdAndCheck(projectId);

    await this.projectSecurity.checkUpdate(dbProject, CnCurrentUserHelper.getAndCheckUserSpaceInfo());
    return dbProject;
  }

  private async checkFindOneAndGetRootProject(projectId: string): Promise<CnProject> {
    const project = await this.projectService.findByIdAndCheck(projectId);

    return await this.projectSecurity.checkFindOneAndGetRootProject(project, CnCurrentUserHelper.getAndCheckUserSpaceInfo());
  }

  //////////////////////////////// EVENT ///////////////////////////////////////
  private emitProjectEvent(eventType: CnProjectEventType, project: CnProject, entity: any): void {
    const event: CnProjectEvent = {
      type: eventType,
      parentProject: project,
      entity,
      userInfo: CnCurrentUserHelper.getAndCheckUserSpaceInfo()
    };
    this.eventEmitter.emit(cnProjectEventName, event);
  }

  // TODO remove
  public async migrateProjectComments(): Promise<void> {
    if (!CnCurrentUserHelper.isAdmin()) {
      throw new BlUnauthorizedException();
    }
    const comments = await this.projectCommentService.findAll();

    this.logger.log(`Migrating ${comments.length} comments`);
    for (const comment of comments) {
      try {
        const newContent = BlQuillMigrator.migrateOptional(comment.content);
        comment.content = newContent;
        await this.projectCommentService.migrateComment(comment);
      } catch (e) {
        this.logger.error(`Error while updating comment ${comment.id}`, e);
      }
    }

    this.logger.log(`End Migrating ${comments.length} comments`);

  }
}
