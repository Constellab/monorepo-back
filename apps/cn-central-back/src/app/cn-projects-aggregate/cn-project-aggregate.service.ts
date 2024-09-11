import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { CnProjectsService } from './cn-projects/cn-projects.service';
import { CnProjectsAggregateSecurity } from './cn-projects-aggregate.security';
import { CnProject, CnProjectWithFolder } from './cn-projects/cn-project.entity';
import { CnCurrentUserHelper } from '../cn-core/utils/cn-current-user.helper';
import { ClDateHelper, ClHelpService, ClPage, ClPageI } from '@monorepo/core-lib';
import { CnExperimentsService } from './cn-experiments/cn-experiments.service';
import { CnReportsService } from './cn-reports/cn-reports.service';
import { CnExperiment, CnExperimentProtocol } from './cn-experiments/cn-experiment.entity';
import { CnCreateLabExperimentDto } from './cn-experiments/cn-experiment.dto';
import { CnCreateReportWithConfigDto } from './cn-reports/cn-report.dto';
import { CnReport } from './cn-reports/cn-report.entity';
import { CnErrorText } from '../cn-core/model/config/cn-error-text.class';
import { CnLabConfig } from '../cn-lab-configs/cn-lab-config.entity';
import { CnProjectStorageLocationDTO, CnSaveProjectDTO } from './cn-projects/cn-project.dto';
import { CnUser } from '../cn-users/cn-user.entity';
import { CnProjectComment, getFakeUserEveryoneMention } from '../cn-project-comment/cn-project-comment.entity';
import { CnProjectCommentService } from '../cn-project-comment/cn-project-comment.service';
import { CnNewCommentDTO } from '../cn-core/model/entities/cn-comment.entity';
import {
  BlBadRequestException,
  BlFile,
  BlFileResponse,
  BlNewRichText,
  BlRichTextContent,
  BlRichTextUploadedImageResponse,
  BlRichTextUploadFileResponse,
  BlSearchBuilder,
  BlSearchParams
} from '@monorepo/back-core-lib';
import { DataSource, In } from 'typeorm';
import { CnProjectBucketService } from './cn-projects/cn-project-bucket.service';
import { CnProjectUserService } from './cn-project-user/cn-project-user.service';
import { CnUsersService } from '../cn-users/cn-users.service';
import { CnProjectUser } from './cn-project-user/cn-project-user.entity';
import {
  CnFolderEvent,
  cnProjectEventName,
  CnProjectEventType,
  cnRemoveProjectFromAllLabsEventName
} from './cn-folder.event';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { CnActivity, CnActivityEntityType } from '../cn-activity/cn-activity.entity';
import { CnActivityService } from '../cn-activity/cn-activity.service';
import { CnBucketLocationDTO } from '../cn-object-storages/cn-buckets/cn-bucket.entity';
import { CnProjectDocumentService } from './cn-project-documents/cn-project-document.service';
import { CnProjectDocument, CnProjectDocumentType } from './cn-project-documents/cn-project-document.entity';
import {
  CnConstellabDocumentDTO,
  CnProjectDocumentPreviewDTO,
  CnProjectStorageUsageDTO
} from './cn-project-documents/cn-project-document-dto.class';
import {
  CnFolderHierarchy,
  CnFolderHierarchyEntity,
  CnFolderHierarchyWithChildren,
  CnFolderObjectType
} from './cn-folder-hierarchies/cn-folder-hierarchy.entity';
import { CnFolderHierarchyService } from './cn-folder-hierarchies/cn-folder-hierarchy.service';

@Injectable()
export class CnProjectAggregateService {

  protected readonly logger = new Logger(CnProjectAggregateService.name);

  constructor(private projectService: CnProjectsService,
              private folderHierarchyService: CnFolderHierarchyService,
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

  async createRootProject(projectDto: CnSaveProjectDTO): Promise<CnProjectWithFolder> {
    const newProject = await this.datasource.transaction(async manager => {
      const entity = this.createProjectFromDTO(projectDto);

      entity.folderHierarchy = CnFolderHierarchyEntity.newRootFolderHierarchyEntity(CnFolderObjectType.FOLDER, projectDto.title,
        CnCurrentUserHelper.getAndCheckCurrentUser(), ClDateHelper.getDate(), CnCurrentUserHelper.getAndCheckCurrentSpace());
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
      await this.projectUserService.shareRootFolderToUserIfNot(dbProject.id, dbProject.leader.id, manager);

      return dbProject;
    });

    this.emitProjectEvent('CREATE_ROOT_PROJECT', null, newProject);
    return this.projectService.findByIdAndCheckWithFolder(newProject.id);
  }

  async createSubProject(projectDto: CnSaveProjectDTO, parentFolderId: string): Promise<CnProjectWithFolder> {
    const entity = this.createProjectFromDTO(projectDto);
    entity.leader = CnCurrentUserHelper.getAndCheckCurrentUser();

    const parentFolder = await this.getAndCheckAuthorizationForUpdate(parentFolderId);
    const parentWithStorage = await this.projectService.findByIfAndCheckWithStorage(parentFolder.id);

    if (entity.endingDate && parentWithStorage.endingDate && entity.endingDate > parentWithStorage.endingDate) {
      throw new BlBadRequestException(CnErrorText.CHILD_PROJECT_END_DATA_AFTER_PARENT);
    }

    entity.folderHierarchy = CnFolderHierarchyEntity.newSubFolderHierarchyEntity(CnFolderObjectType.FOLDER, projectDto.title,
      CnCurrentUserHelper.getAndCheckCurrentUser(), ClDateHelper.getDate(), parentFolder);

    entity.mainStorage = parentWithStorage.mainStorage;
    entity.backupStorage = parentWithStorage.backupStorage;

    const newProject = await this.projectService.create(entity);
    this.emitProjectEvent('CREATE_SUB_PROJECT', parentFolder, newProject);
    return this.projectService.findByIdAndCheckWithFolder(newProject.id);
  }

  private createProjectFromDTO(projectDto: CnSaveProjectDTO): CnProject {
    const project = new CnProject();
    project.title = projectDto.title;
    project.code = projectDto.code;
    project.startingDate = projectDto.startingDate;
    project.endingDate = projectDto.endingDate;
    return project;
  }

  async updateProject(id: string, entity: CnSaveProjectDTO): Promise<CnProjectWithFolder> {
    const folder = await this.getAndCheckAuthorizationForUpdate(id);
    const dbProject = await this.projectService.findByIdAndCheck(id);

    // check that the ending date is not after the parent ending date
    if (entity.endingDate && folder.parentId) {
      const parent = await this.projectService.findByIdAndCheck(folder.parentId);
      if (parent.endingDate && entity.endingDate > parent.endingDate) {
        throw new BlBadRequestException(CnErrorText.CHILD_PROJECT_END_DATA_AFTER_PARENT);
      }
    }

    dbProject.title = entity.title;
    dbProject.code = entity.code;
    dbProject.startingDate = entity.startingDate;
    dbProject.endingDate = entity.endingDate;

    const newProject = await this.projectService.update(dbProject as CnProject);
    this.emitProjectEvent('UPDATE_PROJECT', null, newProject);
    return this.projectService.findByIdAndCheckWithFolder(newProject.id);
  }

  async deleteProject(id: string): Promise<void> {
    const folder = await this.getAndCheckAuthorizationForUpdate(id);

    const children = await this.folderHierarchyService.getDirectChildren(folder.id);

    if (children.find(child => child.objectType === CnFolderObjectType.FOLDER)) {
      throw new BlBadRequestException(CnErrorText.DELETE_PROJECT_WITH_CHILDREN);
    }

    if (children.find(child => child.objectType === CnFolderObjectType.EXPERIMENT)) {
      throw new BlBadRequestException(CnErrorText.DELETE_PROJECT_WITH_EXPERIMENTS);
    }

    if (children.find(child => child.objectType === CnFolderObjectType.REPORT)) {
      throw new BlBadRequestException(CnErrorText.DELETE_PROJECT_WITH_REPORTS);
    }

    const documents = await this.projectDocumentService.getParentFolderDocuments(folder.id, false, 0, 1);
    if (documents.totalElements > 0) {
      throw new BlBadRequestException(CnErrorText.DELETE_PROJECT_WITH_DOCUMENTS);
    }

    // delete all the trashed documents, no transaction because we can't revert between 2 docs
    const trashedDocuments = await this.projectDocumentService.findDocumentsByParentFolder(folder.id);
    for (const document of trashedDocuments) {
      await this.projectDocumentService.deleteDocument(document.id);
    }

    // remove project from all lab using event to avoid circular dependencies.
    // If the user can delete the project, we consider he can remove it from labs
    if (folder.isRootFolder()) {
      const results: string[] = await this.eventEmitter.emitAsync(cnRemoveProjectFromAllLabsEventName, folder);
      // if a text is returned, it means an error occurred
      for (const res of results) {
        if (res) {
          throw new BlBadRequestException(res);
        }
      }
    }

    const project = await this.projectService.findByIdAndCheck(id);
    await this.datasource.transaction(async entityManager => {
      await this.projectService.deleteById(id, entityManager);
      await this.folderHierarchyService.deleteById(id, entityManager);
    });

    this.emitProjectEvent('DELETE_PROJECT', null, project);
  }

  async findProject(id: string): Promise<CnProject> {
    await this.getAndCheckAuthorizationForFindOneByFolder(id);
    return this.projectService.findByIdAndCheck(id);
  }

  public async getCurrentRootFolders(page: number, size: number): Promise<ClPageI<CnFolderHierarchy>> {
    const currentUserInfo = CnCurrentUserHelper.getAndCheckUserSpaceInfo();
    return this.folderHierarchyService.getRootFoldersOfUser(currentUserInfo.userId, currentUserInfo.spaceId,
      page, size);
  }

  public async getByCurrentSpace(page: number, size: number): Promise<ClPageI<CnFolderHierarchy>> {
    const info = CnCurrentUserHelper.getAndCheckUserSpaceInfo();
    await this.projectSecurity.checkFindAllBySpace(info);
    return this.folderHierarchyService.getRootFoldersBySpace(info.spaceId, page, size);
  }

  public async searchInCurrentSpace(searchParams: BlSearchParams, page: number, size: number): Promise<ClPageI<CnFolderHierarchy>> {
    const info = CnCurrentUserHelper.getAndCheckUserSpaceInfo();
    await this.projectSecurity.checkFindAllBySpace(info);
    return this.folderHierarchyService.searchFolderInSpace(info.spaceId, searchParams, page, size);
  }

  public async getFolderObjectTree(folderId: string): Promise<CnFolderHierarchy> {
    const rootFolder = await this.checkFindOneAndGetRootFolder(folderId);

    return await this.folderHierarchyService.getFolderTree(rootFolder);
  }

  public async getFolderTree(rootFolderId: string): Promise<CnFolderHierarchyWithChildren> {
    const folder = await this.folderHierarchyService.findByIdAndCheck(rootFolderId);
    return this.folderHierarchyService.getFolderTree(folder);
  }

  /**
   * Method not secured to get a list of project trees
   * @param rootFolders
   */
  public async getFolderTrees(rootFolders: CnFolderHierarchy[]): Promise<CnFolderHierarchy[]> {
    const folderTrees = rootFolders.map(folder => this.folderHierarchyService.getFolderTree(folder));
    return await Promise.all(folderTrees);
  }

  public async getFolderDirectChildren(folderId: string): Promise<CnFolderHierarchy[]> {
    const project = await this.getAndCheckAuthorizationForFindOneByFolder(folderId);

    return this.folderHierarchyService.getDirectChildren(project.id);
  }

  public async getChildrenPaginated(folderId: string, searchParam: BlSearchParams, page: number, size: number): Promise<ClPage<CnFolderHierarchy>> {
    const folder = await this.getAndCheckAuthorizationForFindOneByFolder(folderId);

    return this.folderHierarchyService.searchVisibleChildren(folder.id, searchParam, page, size);
  }

  public async getFolderAncestors(folderId: string): Promise<CnFolderHierarchy[]> {
    // retrieve the project ancestors
    const folder = await this.getAndCheckAuthorizationForFindOneByFolder(folderId);
    return await this.folderHierarchyService.getAncestors(folder);
  }


  public async updateProjectLeader(projectId: string, userId: string): Promise<CnProject> {
    const folder = await this.folderHierarchyService.findByIdAndCheck(projectId);

    // check if the current user has the authorization to update the leader
    await this.projectSecurity.checkUpdateProjectLeader(folder, CnCurrentUserHelper.getAndCheckUserSpaceInfo());

    const newLeader = await this.userService.findByIdAndCheck(userId);
    await this.datasource.transaction(async (entityManager) => {

      // the group must be shared with the new leader single group
      // so if it is not shared, we add it
      await this.projectUserService.shareRootFolderToUserIfNot(folder.getRootFolderId(), userId, entityManager);

      await this.projectService.updateLeader(folder.id, newLeader, entityManager);
    });

    const project = await this.projectService.findByIdAndCheck(projectId);
    this.emitProjectEvent('UPDATE_PROJECT_LEADER', folder, project);
    return project;
  }

  /////////////////////////////////////// FOLDER HIERARCHY //////////////////////////////////

  public async getFolderHierarchyNotSecure(id: string): Promise<CnFolderHierarchy> {
    return this.folderHierarchyService.findByIdAndCheck(id);
  }

  /////////////////////////////////////// PROJECT DESCRIPTION //////////////////////////////////

  public async getDescription(projectId: string): Promise<BlRichTextContent> {
    await this.getAndCheckAuthorizationForFindOneByFolder(projectId);
    return this.projectService.getProjectDescription(projectId);
  }

  public async updateDescription(projectId: string, description: BlRichTextContent): Promise<void> {
    const folder = await this.getAndCheckAuthorizationForUpdate(projectId);
    await this.projectService.updateDescription(projectId, description);

    // update the folder object to set the hasDescription flag
    folder.hasDescription = !BlNewRichText.isEmpty(description);
    await this.folderHierarchyService.update(folder as CnFolderHierarchyEntity);

    // for this event we send the description
    this.emitProjectEvent('UPDATE_PROJECT_DESCRIPTION', null, description);
  }

  public async saveDescriptionImage(projectId: string, file: BlFile): Promise<BlRichTextUploadedImageResponse> {
    const folder = await this.getAndCheckAuthorizationForUpdate(projectId);

    return this.projectDocumentService.uploadImageDocument(file, folder, CnProjectDocumentType.DESCRIPTION_CONTENT,
      folder.id);
  }

  public async getDescriptionImage(projectId: string, filename: string): Promise<BlFileResponse> {
    const folder = await this.getAndCheckAuthorizationForFindOneByFolder(projectId);

    return this.projectDocumentService.getDocumentContentByTypeAndName(folder.getRootFolderId(), CnProjectDocumentType.DESCRIPTION_CONTENT,
      filename, projectId);
  }

  /////////////////////////////////////// EXPERIMENT //////////////////////////////////

  public async findExperiment(id: string): Promise<CnExperiment> {
    await this.getAndCheckAuthorizationForFindOneByFolder(id);
    return await this.experimentService.findByIdAndCheck(id);
  }

  async getExperimentsByFolder(folderId: string): Promise<CnExperiment[]> {
    // check that the user can get the project
    const project = await this.getAndCheckAuthorizationForFindOneByFolder(folderId);

    return this.experimentService.getExperimentsByParentFolder(project.id);
  }

  async getExperimentsAssociatedToReports(reportId: string): Promise<CnExperiment[]> {
    // check that the user can get the project
    await this.findReport(reportId);

    return (await this.reportService.findByIdAndCheckWithExperiments(reportId)).experiments;
  }

  async createLabExperiment(parentFolderId: string, createLabExperimentDto: CnCreateLabExperimentDto): Promise<void> {
    // check that the user can get the project
    const parentFolder = await this.getAndCheckAuthorizationForFindOneByFolder(parentFolderId);

    const result = await this.experimentService.saveLabExperiment(parentFolder, createLabExperimentDto);

    if (result.mode === 'create') {
      this.emitProjectEvent('CREATE_EXPERIMENT', parentFolder, result.experiment);
    } else {
      this.emitProjectEvent('UPDATE_EXPERIMENT', parentFolder, result.experiment);
    }
  }

  async deleteLabExperiment(parentFolderId: string, experimentId: string): Promise<void> {
    // check that the user can get the project
    const parentFolder = await this.getAndCheckAuthorizationForFindOneByFolder(parentFolderId);

    // check if the experiment has associated reports
    const expWithReports = await this.experimentService.findByIdAndCheckWithReports(experimentId);
    if (expWithReports.reports.length > 0) {
      throw new BlBadRequestException('The experiment has associated reports in the space, please delete the report first.');
    }


    let experiment: CnExperiment;
    await this.datasource.transaction(async entityManager => {
      experiment = await this.experimentService.deleteExperiment(experimentId, entityManager);
      await this.folderHierarchyService.deleteById(experimentId, entityManager);
    });
    if (experiment) {
      this.emitProjectEvent('DELETE_EXPERIMENT', parentFolder, experiment);
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

  public async getExperimentsByRootFolderAndLabInstanceNotSecure(rootFolderId: string, labInstanceId: string): Promise<CnExperiment[]> {
    return this.experimentService.getExperimentsByRootFolderAndLabInstance(rootFolderId, labInstanceId);
  }

  /////////////////////////////////////// REPORT //////////////////////////////////

  public async findReport(id: string): Promise<CnReport> {
    await this.getAndCheckAuthorizationForFindOneByFolder(id);
    return await this.reportService.findByIdAndCheck(id);
  }

  public async findReportContent(id: string): Promise<BlRichTextContent> {
    const reportFolder = await this.getAndCheckAuthorizationForFindOneByFolder(id);
    const parentFolder = await this.folderHierarchyService.findByIdAndCheck(reportFolder.parentId);
    return this.reportService.getReportContent(parentFolder, id);
  }

  async createLabReport(createReportDto: CnCreateReportWithConfigDto, parentFolderId: string,
                        files: BlFile[]): Promise<void> {
    const parentFolder = await this.getAndCheckAuthorizationForFindOneByFolder(parentFolderId);

    // get and check all experiment
    const experiments: CnExperiment[] = [];
    for (const experimentId of createReportDto.experiment_ids) {
      const experiment: CnExperiment = await this.experimentService.findById(experimentId, { folderHierarchy: true });

      if (experiment == null) {
        throw new BlBadRequestException('Can\'t create the report because one of the linked experiment could not be found');
      }

      if (experiment.folderHierarchy.parentId !== parentFolder.id) {
        throw new BlBadRequestException('Can\'t create the report because it is linked to an experiment of another folder');
      }
      experiments.push(experiment);
    }

    const reportResult = await this.reportService.saveReport(createReportDto, experiments,
      parentFolder, files);

    if (reportResult.mode === 'create') {
      this.emitProjectEvent('CREATE_REPORT', parentFolder, reportResult.report);
    } else {
      this.emitProjectEvent('UPDATE_REPORT', parentFolder, reportResult.report);
    }
  }

  async deleteReportFromLab(parentFolderId: string, reportId: string): Promise<void> {
    // check that the user can get the project
    const parentFolder = await this.getAndCheckAuthorizationForFindOneByFolder(parentFolderId);

    let report: CnReport;
    await this.datasource.transaction(async entityManager => {
      report = await this.reportService.deleteReport(reportId, entityManager);
      await this.folderHierarchyService.deleteById(reportId, entityManager);
    });

    if (report) {
      this.emitProjectEvent('DELETE_REPORT', parentFolder, report);
    }
  }

  async deleteReport(reportId: string): Promise<void> {
    // for now, only admin can delete report directly
    if (!CnCurrentUserHelper.isAdmin()) {
      throw new UnauthorizedException();
    }
    const reportFolder = await this.folderHierarchyService.findByIdAndCheck(reportId, { parent: true });

    await this.deleteReportFromLab(reportFolder.parentId, reportId);
  }

  async getReportAssociatedToExperiment(experimentId: string): Promise<CnReport[]> {
    await this.findExperiment(experimentId);

    return (await this.experimentService.findByIdAndCheckWithReports(experimentId)).reports;
  }

  async getReportFile(reportId: string, filename: string): Promise<BlFileResponse> {
    const reportFolder = await this.getAndCheckAuthorizationForFindOneByFolder(reportId);
    const parentFolder = await this.folderHierarchyService.findByIdAndCheck(reportFolder.parentId);
    return this.reportService.getFile(filename, parentFolder, reportId);
  }

  async getReportView(reportId: string, viewId: string): Promise<BlFileResponse> {
    const reportFolder = await this.getAndCheckAuthorizationForFindOneByFolder(reportId);
    const parentFolder = await this.folderHierarchyService.findByIdAndCheck(reportFolder.parentId);
    return this.reportService.getView(viewId, parentFolder, reportId);
  }

  public getReportsByRootFolderAndLabInstance(rootFolderId: string, labInstanceId: string): Promise<CnReport[]> {
    return this.reportService.getReportsByRootFolderAndLabInstance(rootFolderId, labInstanceId);
  }

  /////////////////////////////////////// GROUPS //////////////////////////////////

  public async shareFolder(rootFolderId: string, groupId: string): Promise<CnUser[]> {
    const folder = await this.getAndCheckAuthorizationForUpdate(rootFolderId);

    if (!folder.isRootFolder()) {
      throw new BlBadRequestException('Only root folders can be shared');
    }

    const newUsers = await this.projectUserService.shareRootFolderToGroup(folder.id, groupId);

    this.emitProjectEvent('SHARE_PROJECT', folder, newUsers);

    return this.projectUserService.findUsersByRootFolderId(rootFolderId);
  }

  public async unshareProject(projectId: string, userId: string): Promise<void> {
    const folder = await this.getAndCheckAuthorizationForUpdate(projectId);

    const project = await this.projectService.findByIdAndCheck(projectId);
    // forbid to unshare the single user group of the leader
    // this is to unsure the leader will always have access to the project
    if (userId === project.leader.id) {
      throw new BlBadRequestException(CnErrorText.CANT_UNSHARED_PROJECT_LEADER_GROUP);
    }

    const user = await this.userService.findByIdAndCheck(userId);
    await this.projectUserService.unshareRootFolderFromUser(folder.id, userId);

    this.emitProjectEvent('UNSHARE_PROJECT', folder, user);
  }

  /**
   * Return the complete list of user that have access to the project
   * @param folderId
   */
  public async getUsersOfProject(folderId: string): Promise<CnUser[]> {
    const rootFolder = await this.checkFindOneAndGetRootFolder(folderId);

    return this.projectUserService.findUsersByRootFolderId(rootFolder.id);
  }

  public async searchProjectUsersByName(folderId: string, name: string, page: number, size: number): Promise<ClPage<CnUser>> {
    const rootProject = await this.checkFindOneAndGetRootFolder(folderId);

    const result = await this.projectUserService.smartSearchByName(rootProject.id, name, page, size);
    const users = result.map(user => user.user);

    if (ClHelpService.isNullOrEmpty(name)) {
      users.objects.unshift(getFakeUserEveryoneMention());
    }

    return users;
  }


  /////////////////////////////////////// PROJECT COMMENT //////////////////////////////////

  async activateChat(projectId: string, enable: boolean): Promise<CnProject> {
    await this.getAndCheckAuthorizationForUpdate(projectId);

    await this.datasource.transaction(async entityManager => {
      await this.projectService.updatePartial(projectId, { chatEnabled: enable }, entityManager);
      await this.folderHierarchyService.updatePartial(projectId, { chatEnabled: enable }, entityManager);
    });

    return this.projectService.findByIdAndCheck(projectId);
  }

  async getChatFolders(): Promise<CnFolderHierarchyWithChildren[]> {
    const rootFoldersPage = await this.getCurrentRootFolders(0, 20);

    const rootFolders = rootFoldersPage.objects;

    const rootFoldersWithChildren: CnFolderHierarchyWithChildren[] = [];
    for (const rootFolder of rootFolders) {
      rootFoldersWithChildren.push(await this.folderHierarchyService.getFolderTreeForChat(rootFolder));
    }

    return rootFoldersWithChildren;
  }

  public async createFolderComment(newComment: CnNewCommentDTO, folderId: string): Promise<CnProjectComment> {
    const folder = await this.getAndCheckAuthorizationForFindOneByFolder(folderId);

    const comment = await this.projectCommentService.createComment(newComment, folder);

    this.emitProjectEvent('CREATE_PROJECT_COMMENT', folder, comment);
    return comment;
  }

  public async updateFolderComment(folderId: string, commentId: string, content: BlRichTextContent): Promise<CnProjectComment> {
    const folder = await this.getAndCheckAuthorizationForFindOneByFolder(folderId);

    const comment = await this.projectCommentService.findByIdAndCheck(commentId);
    if (comment.createdBy.id != CnCurrentUserHelper.getCurrentUser().id) {
      throw new UnauthorizedException();
    }

    const newComment = await this.projectCommentService.updateComment(comment, content);
    this.emitProjectEvent('UPDATE_PROJECT_COMMENT', folder, comment);
    return newComment;
  }

  public async deleteFolderComment(folderId: string, commentId: string): Promise<void> {
    const folder = await this.getAndCheckAuthorizationForFindOneByFolder(folderId);

    const comment = await this.projectCommentService.findByIdAndCheck(commentId);
    if (comment.createdBy.id != CnCurrentUserHelper.getCurrentUser().id) {
      throw new UnauthorizedException();
    }

    await this.projectCommentService.deleteComment(comment, folderId);
    this.emitProjectEvent('DELETE_PROJECT_COMMENT', folder, comment);

  }

  public async getFolderComments(folderId: string, page: number, size: number): Promise<ClPage<CnProjectComment>> {
    await this.getAndCheckAuthorizationForFindOneByFolder(folderId);
    return this.projectCommentService.getProjectComments(folderId, page, size);
  }

  public async saveCommentImage(file: BlFile, folderId: string): Promise<BlRichTextUploadedImageResponse> {
    const folder = await this.getAndCheckAuthorizationForFindOneByFolder(folderId);
    return this.projectCommentService.saveFolderCommentImage(file, folder);
  }

  public async getCommentImage(filename: string, folderId: string): Promise<BlFileResponse> {
    const folder = await this.getAndCheckAuthorizationForFindOneByFolder(folderId);
    return await this.projectCommentService.getCommentImage(folder, filename);
  }

  /////////////////////////////////////// DOCUMENT //////////////////////////////////

  public async uploadDocument(parentFolderId: string, file: BlFile): Promise<CnFolderHierarchy> {
    const folder = await this.getAndCheckAuthorizationForFindOneByFolder(parentFolderId);

    const doc = await this.projectDocumentService.uploadDocument(file, folder,
      CnProjectDocumentType.UPLOADED_DOCUMENT, folder.id, file.originalname);

    this.emitProjectEvent('UPLOAD_PROJECT_DOCUMENT', folder, doc);

    return this.folderHierarchyService.findByIdAndCheck(doc.id);
  }

  public async getUploadedDocument(documentId: string): Promise<BlFileResponse> {
    const folder = await this.getAndCheckAuthorizationForFindOneByFolder(documentId);
    const document = await this.projectDocumentService.findByIdAndCheck(documentId);

    return await this.projectDocumentService.getDocumentContentByDocument(folder.getRootFolderId(), document);
  }

  public async deleteDocument(documentId: string): Promise<void> {
    const folder = await this.getAndCheckAuthorizationForFindOneByFolder(documentId);

    const document = await this.projectDocumentService.findByIdAndCheck(documentId);

    await this.datasource.transaction(async entityManager => {
      await this.projectDocumentService.deleteDocument(documentId, entityManager);
    });

    this.emitProjectEvent('DELETE_PROJECT_DOCUMENT',
      await this.folderHierarchyService.findByIdAndCheck(folder.parentId),
      document);
  }

  public async moveDocumentToTrash(documentId: string): Promise<CnProjectDocument> {
    const folder = await this.getAndCheckAuthorizationForFindOneByFolder(documentId);

    const document = await this.projectDocumentService.findByIdAndCheck(documentId);

    const doc = await this.projectDocumentService.moveToTrash(document);

    this.emitProjectEvent('MOVE_PROJECT_DOCUMENT_TO_TRASH',
      await this.folderHierarchyService.findByIdAndCheck(folder.parentId),
      document);

    return doc;
  }

  public async restoreDocumentFromTrash(documentId: string): Promise<CnProjectDocument> {
    const folder = await this.getAndCheckAuthorizationForFindOneByFolder(documentId);

    const document = await this.projectDocumentService.findByIdAndCheck(documentId);

    const doc = await this.projectDocumentService.restoreFromTrash(document);

    this.emitProjectEvent('RESTORE_PROJECT_DOCUMENT_FROM_TRASH',
      await this.folderHierarchyService.findByIdAndCheck(folder.parentId),
      document);

    return doc;
  }

  public async emptyTrash(folderId: string): Promise<void> {
    const folder = await this.getAndCheckAuthorizationForFindOneByFolder(folderId);

    await this.projectDocumentService.emptyFolderTrash(folder.id);
  }

  public async getDocumentsByFolder(parentFolderId: string, inTrash: boolean, page: number, size: number): Promise<ClPage<CnProjectDocument>> {
    await this.getAndCheckAuthorizationForFindOneByFolder(parentFolderId);

    return this.projectDocumentService.getParentFolderDocuments(parentFolderId, inTrash, page, size);
  }

  public async renameDocument(documentId: string, newName: string): Promise<CnProjectDocument> {
    const folder = await this.getAndCheckAuthorizationForFindOneByFolder(documentId);

    const document = await this.projectDocumentService.findByIdAndCheck(documentId, { folderHierarchy: true });

    const doc = this.projectDocumentService.renameDocument(folder.getRootFolderId(), document, newName);

    this.emitProjectEvent('RENAME_DOCUMENT',
      await this.folderHierarchyService.findByIdAndCheck(document.folderHierarchy.parentId),
      document);

    return doc;
  }

  public async moveDocumentToFolder(documentId: string, parentFolderId: string): Promise<CnProjectDocument> {
    const document = await this.projectDocumentService.findByIdAndCheck(documentId, { folderHierarchy: true });

    if (document.folderHierarchy.parentId === parentFolderId) {
      throw new BlBadRequestException('The document is already in the destination folder');
    }

    // check if the user has the authorization to move the document on 2 projects
    const oldFolder = await this.getAndCheckAuthorizationForFindOneByFolder(document.folderHierarchy.parentId);
    const newFolder = await this.getAndCheckAuthorizationForFindOneByFolder(parentFolderId);

    return this.projectDocumentService.moveDocument(document, oldFolder, newFolder);
  }


  ////////////////////////////////////////////// CONSTELLAB DOCUMENTS //////////////////////////////////////////////
  public async createConstellabDocument(parentFolderId: string, filename: string): Promise<CnConstellabDocumentDTO> {
    const parentFolder = await this.getAndCheckAuthorizationForFindOneByFolder(parentFolderId);

    const doc = await this.projectDocumentService.createConstellabDocument(parentFolder, filename);
    this.emitProjectEvent('CREATE_CONSTELLAB_DOCUMENT', parentFolder, doc.document);
    return doc;
  }

  public async updateConstellabDocument(documentId: string, content: BlRichTextContent): Promise<CnConstellabDocumentDTO> {
    const folder = await this.getAndCheckAuthorizationForFindOneByFolder(documentId);

    const document = await this.projectDocumentService.findByIdAndCheck(documentId);

    const newDoc = await this.projectDocumentService.updateConstellabDocument(folder.getRootFolderId(), document, content);

    this.emitProjectEvent('UPDATE_CONSTELLAB_DOCUMENT',
      await this.folderHierarchyService.findByIdAndCheck(folder.parentId),
      newDoc);
    return newDoc;
  }

  public async getConstellabDocument(documentId: string): Promise<CnConstellabDocumentDTO> {
    const folder = await this.getAndCheckAuthorizationForFindOneByFolder(documentId);

    // TODO voir si on peut améliorer et mettre en commun
    const document = await this.projectDocumentService.findByIdAndCheck(documentId);
    return this.projectDocumentService.getConstellabDocument(folder.getRootFolderId(), document);
  }

  public async uploadImageToConstellabDocument(documentId: string, file: BlFile): Promise<BlRichTextUploadedImageResponse> {
    const folder = await this.getAndCheckAuthorizationForFindOneByFolder(documentId);

    const document = await this.projectDocumentService.findByIdAndCheck(documentId);
    const parentFolder = await this.folderHierarchyService.findByIdAndCheck(folder.parentId);

    return this.projectDocumentService.uploadImageToConstellabDocument(parentFolder, document, file);
  }

  public async uploadFileToConstellabDocument(documentId: string, file: BlFile): Promise<BlRichTextUploadFileResponse> {
    const folder = await this.getAndCheckAuthorizationForFindOneByFolder(documentId);

    const document = await this.projectDocumentService.findByIdAndCheck(documentId);
    const parentFolder = await this.folderHierarchyService.findByIdAndCheck(folder.parentId);

    return this.projectDocumentService.uploadFileToConstellabDocument(parentFolder, document, file);
  }

  /**
   * Get the document (image or file) of a constellab document
   * @param documentId
   * @param documentName
   */
  public async getConstellabDocumentContentDocument(documentId: string, documentName: string): Promise<BlFileResponse> {
    const folder = await this.getAndCheckAuthorizationForFindOneByFolder(documentId);

    return this.projectDocumentService.getDocumentContentByTypeAndName(folder.getRootFolderId(),
      CnProjectDocumentType.CONSTELLAB_DOCUMENT_CONTENT, documentName, documentId);
  }

  ////////////////////////////////////////////// DOCUMENT PREVIEW  /////////////////////////////////////////////

  public async generatePreviewToken(documentId: string): Promise<CnProjectDocumentPreviewDTO> {
    await this.getAndCheckAuthorizationForFindOneByFolder(documentId);

    const document = await this.projectDocumentService.findByIdAndCheck(documentId);

    return await this.projectDocumentService.generatePreviewToken(document);
  }

  /**
   * Public route to access document from the generated token
   * @param token
   */
  public async getDocumentByPreviewToken(token: string): Promise<BlFileResponse> {
    const document = await this.projectDocumentService.getAndCheckByPreviewToken(token);
    const folder = await this.getAndCheckAuthorizationForFindOneByFolder(document.id);

    return this.projectDocumentService.getDocumentContentByDocument(folder.getRootFolderId(), document);
  }

  public async migrateDocuments(): Promise<void> {
    if(!CnCurrentUserHelper.isAdmin()) throw new UnauthorizedException();
    await this.projectDocumentService.migrateDocumentInBucket();
  }

  /////////////////////////////////////// PROJECT BUCKET //////////////////////////////////

  public async createProjectBucket(projectId: string, projectStorageDTO: CnProjectStorageLocationDTO)
    : Promise<CnProjectStorageLocationDTO> {
    await this.getAndCheckAuthorizationForUpdate(projectId);

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

    await this.projectService.update(projectWithStorage as CnProject);

    return {
      mainStorage: projectWithStorage.mainStorage?.getBucketLocation() ?? null,
      backupStorage: projectWithStorage.backupStorage?.getBucketLocation() ?? null
    };
  }

  public async getProjectStorage(projectId: string): Promise<CnProjectStorageLocationDTO> {
    await this.getAndCheckAuthorizationForUpdate(projectId);

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

  public async getStorageSizeByFolder(folderId: string): Promise<CnProjectStorageUsageDTO> {
    await this.getAndCheckAuthorizationForFindOneByFolder(folderId);

    const children = await this.getFolderDirectChildren(folderId);

    return this.projectDocumentService.getStorageSizeDetailByFolders([folderId, ...children.map(project => project.id)]);
  }

  /**
   * return true if the root project id used the lab as storage (datahub)
   * @param rootProjectId
   * @param labId
   */
  public async projectUsesLabStorage(rootProjectId: string, labId: string): Promise<boolean> {
    return this.projectBucketService.projectUsesLabStorage(rootProjectId, labId);
  }

  /////////////////////////////////////// PROJECT USER //////////////////////////////////
  public async getCurrentUserRootFolderConfig(rootFolderId: string): Promise<CnProjectUser> {
    await this.getAndCheckAuthorizationForFindOneByFolder(rootFolderId);

    return this.projectUserService.findByRootFolderIdAndUserId(rootFolderId, CnCurrentUserHelper.getAndCheckCurrentUser().id);
  }

  public async updateRootProjectCurrentUserConfig(rootProjectId: string, options: CnProjectUser): Promise<CnProjectUser> {
    const folder = await this.getAndCheckAuthorizationForFindOneByFolder(rootProjectId);

    if (!folder.isRootFolder()) {
      throw new BlBadRequestException('The folder is not a root folder');
    }

    options.rootFolderId = rootProjectId;
    options.userId = CnCurrentUserHelper.getAndCheckCurrentUser().id;

    return this.projectUserService.updateProjectUser(options);
  }

  /////////////////////////////////////// ACTIVITY //////////////////////////////////

  public async searchFolderActivity(folderId: string, searchParam: BlSearchParams,
                                    page: number, size: number): Promise<ClPage<CnActivity>> {
    // check that the user can view the project
    const folder = await this.getAndCheckAuthorizationForFindOneByFolder(folderId);

    const searchBuilder = new BlSearchBuilder<CnActivity>({ createdAt: 'DESC' as any });

    if (searchParam.hasFilter('includeSubProjects')) {
      const allProjects = await this.folderHierarchyService.getFolderTreeAsList(folder);
      const allProjectIds = allProjects.map(project => project.id);
      searchBuilder.mergeWhereOptions({
        parentEntityId: In(allProjectIds)
      });
      searchParam.removeFilter('includeSubProjects');
    } else {
      searchBuilder.mergeWhereOptions({
        parentEntityId: folderId
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

  private async getAndCheckAuthorizationForFindOneByFolder(folderId: string): Promise<CnFolderHierarchy> {
    const folder = await this.folderHierarchyService.findByIdAndCheck(folderId);

    await this.projectSecurity.checkFindOne(folder, CnCurrentUserHelper.getAndCheckUserSpaceInfo());
    return folder;
  }

  private async getAndCheckAuthorizationForUpdate(folderId: string): Promise<CnFolderHierarchy> {
    const folder = await this.folderHierarchyService.findByIdAndCheck(folderId);

    await this.projectSecurity.checkUpdate(folder, CnCurrentUserHelper.getAndCheckUserSpaceInfo());
    return folder;
  }

  private async checkFindOneAndGetRootFolder(folderId: string): Promise<CnFolderHierarchy> {
    const folder = await this.folderHierarchyService.findByIdAndCheck(folderId);

    return await this.projectSecurity.checkFindOneAndGetRootProject(folder, CnCurrentUserHelper.getAndCheckUserSpaceInfo());
  }

  //////////////////////////////// EVENT ///////////////////////////////////////
  private emitProjectEvent(eventType: CnProjectEventType, parentFolder: CnFolderHierarchy, entity: any): void {
    const event: CnFolderEvent = {
      type: eventType,
      parentFolder: parentFolder,
      entity,
      userInfo: CnCurrentUserHelper.getAndCheckUserSpaceInfo()
    };
    this.eventEmitter.emit(cnProjectEventName, event);
  }
}
