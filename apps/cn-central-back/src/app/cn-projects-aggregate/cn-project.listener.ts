import { Injectable } from '@nestjs/common';
import { CnProjectUserService } from './cn-project-user/cn-project-user.service';
import { OnEvent } from '@nestjs/event-emitter';
import { CnActivityCreateDTO, CnActivityService } from '../cn-activity/cn-activity.service';
import { CnProjectNotifOptions, CnProjectUser } from './cn-project-user/cn-project-user.entity';
import { CnActivity, CnActivityEntityType, CnActivityType } from '../cn-activity/cn-activity.entity';
import { CnNotificationService } from '../cn-notification/cn-notification.service';
import { CnFrontService } from '../cn-core/services/cn-front.service';
import { CnFolderEvent, cnProjectEventName, CnProjectEventType } from './cn-folder.event';
import { CnProjectSimple } from './cn-projects/cn-project.entity';
import { CnUser } from '../cn-users/cn-user.entity';
import { CnExperiment } from './cn-experiments/cn-experiment.entity';
import { CnReport } from './cn-reports/cn-report.entity';
import { CnProjectComment, getFakeUserEveryoneMention } from '../cn-project-comment/cn-project-comment.entity';
import { BlMailService, BlMentionUser, BlNewRichText, BlRichTextContent } from '@monorepo/back-core-lib';
import { CnCurrentUserHelper } from '../cn-core/utils/cn-current-user.helper';
import { CnMailTemplate } from '../cn-core/model/config/cn-mail-template.class';
import { CnProjectDocument } from './cn-project-documents/cn-project-document.entity';
import { CnFolderHierarchyService } from './cn-folder-hierarchies/cn-folder-hierarchy.service';
import { CnFolderHierarchy } from './cn-folder-hierarchies/cn-folder-hierarchy.entity';
import { CnFolderObject } from './cn-folder-hierarchies/cn-folder-object.entity';

export interface CnNotifInfo {
  link: string;
}

export interface CnActivityAndNotif {
  activity: CnActivityCreateDTO;
  notif?: CnNotifInfo;
}

@Injectable()
export class CnProjectListener {

  constructor(private projectUserService: CnProjectUserService,
              private folderHierarchyService: CnFolderHierarchyService,
              private notificationService: CnNotificationService,
              private activityService: CnActivityService,
              private mailService: BlMailService,
              private frontService: CnFrontService) {
  }


  @OnEvent(cnProjectEventName)
  async handleProjectEvent(event: CnFolderEvent): Promise<void> {

    console.log('handleProjectEvent', event.type);
    const activityAndNotif: CnActivityAndNotif = this.getActivityDTO(event);
    if (activityAndNotif == null) return;
    console.log('handleProjectEven22222', event.type);

    const activity = await this.createActivity(activityAndNotif.activity, event);

    // specific case for comment to handle mentions
    if (event.type === 'CREATE_PROJECT_COMMENT') {
      await this.handleCommentCreated(activity, event.entity, event.parentFolder);
    } else if (event.type === 'DELETE_PROJECT_COMMENT') {
      await this.handleCommentDeleted(activity, event.entity);
    } else if (activityAndNotif.notif) {
      await this.createNotification(activity, activityAndNotif.notif, event.parentFolder);
    }
  }

  private async createActivity(activityDTO: CnActivityCreateDTO, event: CnFolderEvent): Promise<CnActivity> {
    activityDTO.user = event.userInfo.user;
    activityDTO.space = event.userInfo.space;
    activityDTO.parentEntityId = event.parentFolder.id;

    return await this.activityService.create(activityDTO);
  }

  /**
   * Get all user of project and send notification to user that have notif mode for this entity type
   * @private
   */
  private async createNotification(activity: CnActivity, notifInfo: CnNotifInfo, parentFolder: CnFolderHierarchy): Promise<void> {
    if (!parentFolder) return;

    const projectUsers = await this.projectUserService.findByRootFolderId(parentFolder.getRootFolderId());

    let ancestorIds: string[] = [];
    // for delete type, don't store the ancestors
    if (activity.actionType !== CnActivityType.DELETE) {
      const ancestors = await this.folderHierarchyService.getAncestorsByFolderId(parentFolder.id);
      ancestorIds = ancestors.map(a => a.id);
    }

    for (const projectUser of projectUsers) {
      await this.sendNotification(projectUser,
        activity.user, activity.space.id, activity.entityType, activity.entityId,
        activity.cleanTitle, notifInfo.link, parentFolder, ancestorIds);
    }
  }

  /**
   * Send notification to the project user if notification are activated or the mode
   * @private
   */
  private async sendNotification(projectUser: CnProjectUser,
                                 activityUser: CnUser,
                                 spaceId: string,
                                 entityType: CnActivityEntityType,
                                 entityId: string,
                                 text: string,
                                 appRoute: string,
                                 parentFolder: CnFolderHierarchy, ancestorFolderIds: string[]): Promise<void> {
    if (projectUser.userId === activityUser.id) return;

    const notifMode = this.getNotifMode(projectUser, entityType);
    if (notifMode === CnProjectNotifOptions.NONE) return;

    // notif
    if (notifMode === CnProjectNotifOptions.NOTIF_AND_EMAIL || notifMode === CnProjectNotifOptions.NOTIF_ONLY) {
      await this.notificationService.createNotification({
        user: projectUser.user,
        link: appRoute,
        spaceId: spaceId,
        createdBy: activityUser,
        objectType: entityType,
        text: text,
        text2: parentFolder.name,
        objectId: entityId,
        associatedObjectIds: ancestorFolderIds
      });
    }

    // mail
    if (notifMode === CnProjectNotifOptions.NOTIF_AND_EMAIL || notifMode === CnProjectNotifOptions.EMAIL_ONLY) {
      const fullLink = this.frontService.getBaseWebsiteURL() + '/' + appRoute;
      await this.mailService.sendMailToUser(CnMailTemplate.project_notification, [projectUser.user],
        {
          content: text,
          user: projectUser.user,
          title: parentFolder.name,
          link: fullLink
        }, text);
    }
  }

  private getActivityDTO(event: CnFolderEvent): CnActivityAndNotif {
    switch (event.type) {
      case 'CREATE_SUB_PROJECT':
        return this.subProjectCreated(event.entity, event.parentFolder);
      case 'UPDATE_PROJECT':
        return this.projectUpdated(event.entity);
      case 'UPDATE_PROJECT_LEADER':
        return this.projectLeaderUpdated(event.entity);
      case 'SHARE_PROJECT':
        return this.projectShared(event.entity, event.parentFolder);
      case 'UNSHARE_PROJECT':
        return this.projectUnshared(event.entity, event.parentFolder);
      case 'CREATE_EXPERIMENT':
        return this.experimentCreated(event.entity, event.parentFolder);
      case 'UPDATE_EXPERIMENT':
        return this.experimentUpdated(event.entity, event.parentFolder);
      case 'DELETE_EXPERIMENT':
        return this.experimentDeleted(event.entity, event.parentFolder);
      case 'CREATE_REPORT':
        return this.reportCreated(event.entity, event.parentFolder);
      case 'UPDATE_REPORT':
        return this.reportUpdated(event.entity, event.parentFolder);
      case 'DELETE_REPORT':
        return this.reportDeleted(event.entity, event.parentFolder);
      case 'CREATE_CONSTELLAB_DOCUMENT':
        return this.constellabDocCreated(event.entity);
      case 'UPLOAD_PROJECT_DOCUMENT':
        return this.documentCreated(event.entity, event.parentFolder);
      case 'DELETE_PROJECT_DOCUMENT':
        return this.documentDeleted(event.entity, event.parentFolder);
      case 'CREATE_PROJECT_COMMENT':
        return this.projectCommentCreated(event.entity, event.parentFolder);
      case 'DELETE_PROJECT_COMMENT':
        return this.projectCommentDeleted(event.entity, event.parentFolder);
      default:
        return null;
    }
  }


  private subProjectCreated(project: CnProjectSimple, parentFolder: CnFolderHierarchy): CnActivityAndNotif {
    return {
      activity: {
        entityType: CnActivityEntityType.PROJECT,
        entity: project,
        actionType: CnActivityType.CREATE,
        title: `{{user.name}} has created sub project ${project.title} under project ${parentFolder.name}`,
        entityName: project.title
      }, notif: { link: CnFrontService.getProjectRoute(project.id) }
    };
  }

  private projectUpdated(project: CnProjectSimple): CnActivityAndNotif {
    return {
      activity: {
        entityType: CnActivityEntityType.PROJECT,
        entity: project,
        actionType: CnActivityType.UPDATE,
        title: `{{user.name}} has updated project ${project.title}`,
        entityName: project.title
      }, notif: { link: CnFrontService.getProjectRoute(project.id) }
    };
  }

  private projectLeaderUpdated(project: CnProjectSimple): CnActivityAndNotif {
    return {
      activity: {
        entityType: CnActivityEntityType.PROJECT,
        entity: project,
        actionType: CnActivityType.UPDATE,
        title: `{{user.name}} has changed leader of project ${project.title} to ${project.leader.alias}`,
        entityName: project.title
      }, notif: { link: CnFrontService.getProjectRoute(project.id) }
    };
  }

  private projectShared(users: CnUser[], parentFolder: CnFolderHierarchy): CnActivityAndNotif {
    const userText = users.length === 1 ? users[0].alias : `${users.length} users`;
    return {
      activity: {
        entityType: CnActivityEntityType.PROJECT,
        entity: parentFolder,
        actionType: CnActivityType.UPDATE,
        title: `{{user.name}} added ${userText} to project ${parentFolder.name}`,
        entityName: parentFolder.name
      }, notif: { link: CnFrontService.getProjectRoute(parentFolder.id) }
    };
  }

  private projectUnshared(user: CnUser, parentFolder: CnFolderHierarchy): CnActivityAndNotif {
    return {
      activity: {
        entityType: CnActivityEntityType.PROJECT,
        entity: parentFolder,
        actionType: CnActivityType.UPDATE,
        title: `{{user.name}} removed ${user.alias} from project ${parentFolder.name}`,
        entityName: parentFolder.name
      }, notif: { link: CnFrontService.getProjectRoute(parentFolder.id) }
    };
  }

  private experimentCreated(experiment: CnExperiment, parentFolder: CnFolderHierarchy): CnActivityAndNotif {
    return {
      activity: {
        entityType: CnActivityEntityType.EXPERIMENT,
        entity: experiment,
        actionType: CnActivityType.CREATE,
        title: `{{user.name}} has created experiment ${experiment.title} under project ${parentFolder.name}`,
        entityName: experiment.title
      }, notif: { link: CnFrontService.getExperimentRoute(experiment.id) }
    };
  }

  private experimentUpdated(experiment: CnExperiment, parentFolder: CnFolderHierarchy): CnActivityAndNotif {
    return {
      activity: {
        entityType: CnActivityEntityType.EXPERIMENT,
        entity: experiment,
        actionType: CnActivityType.UPDATE,
        title: `{{user.name}} has updated experiment ${experiment.title} under project ${parentFolder.name}`,
        entityName: experiment.title
      }, notif: { link: CnFrontService.getExperimentRoute(experiment.id) }
    };
  }

  private experimentDeleted(experiment: CnExperiment, parentFolder: CnFolderHierarchy): CnActivityAndNotif {
    return {
      activity: {
        entityType: CnActivityEntityType.EXPERIMENT,
        entity: experiment,
        actionType: CnActivityType.DELETE,
        title: `{{user.name}} has deleted experiment ${experiment.title} under project ${parentFolder.name}`,
        entityName: experiment.title
      }, notif: { link: CnFrontService.getProjectRoute(parentFolder.id) }
    };
  }

  private reportCreated(report: CnReport, parentFolder: CnFolderHierarchy): CnActivityAndNotif {
    return {
      activity: {
        entityType: CnActivityEntityType.REPORT,
        entity: report,
        actionType: CnActivityType.CREATE,
        title: `{{user.name}} has created report ${report.title} under project ${parentFolder.name}`,
        entityName: report.title
      }, notif: { link: CnFrontService.getReportRoute(report.id) }
    };
  }

  private reportUpdated(report: CnReport, parentFolder: CnFolderHierarchy): CnActivityAndNotif {
    return {
      activity: {
        entityType: CnActivityEntityType.REPORT,
        entity: report,
        actionType: CnActivityType.UPDATE,
        title: `{{user.name}} has updated report ${report.title} under project ${parentFolder.name}`,
        entityName: report.title
      }, notif: { link: CnFrontService.getReportRoute(report.id) }
    };
  }

  private reportDeleted(report: CnReport, parentFolder: CnFolderHierarchy): CnActivityAndNotif {
    return {
      activity: {
        entityType: CnActivityEntityType.REPORT,
        entity: report,
        actionType: CnActivityType.DELETE,
        title: `{{user.name}} has deleted report ${report.title} under project ${parentFolder.name}`,
        entityName: report.title
      }, notif: { link: CnFrontService.getProjectRoute(parentFolder.id) }
    };
  }

  private constellabDocCreated(document: CnProjectDocument): CnActivityAndNotif {
    return {
      activity: {
        entityType: CnActivityEntityType.PROJECT_DOCUMENT,
        entity: document,
        actionType: CnActivityType.CREATE,
        title: `{{user.name}} has created constellab document ${document.name}`,
        entityName: document.name
      }, notif: { link: CnFrontService.getConstellabDocRoute(document.id) }
    };
  }


  private documentCreated(document: CnProjectDocument, parentFolder: CnFolderHierarchy): CnActivityAndNotif {
    return {
      activity: {
        entityType: CnActivityEntityType.PROJECT_DOCUMENT,
        entity: document,
        actionType: CnActivityType.CREATE,
        title: `{{user.name}} has uploaded document ${document.name}`,
        entityName: document.name
      }, notif: { link: CnFrontService.getProjectRoute(parentFolder.id) }
    };
  }

  private documentDeleted(document: CnProjectDocument, parentFolder: CnFolderHierarchy): CnActivityAndNotif {
    return {
      activity: {
        entityType: CnActivityEntityType.PROJECT_DOCUMENT,
        entity: document,
        actionType: CnActivityType.DELETE,
        title: `{{user.name}} has deleted document ${document.name}`,
        entityName: document.name
      }, notif: { link: CnFrontService.getProjectRoute(parentFolder.id) }
    };
  }

  private projectCommentCreated(comment: CnProjectComment, parentFolder: CnFolderHierarchy): CnActivityAndNotif {
    return {
      activity: {
        entityType: CnActivityEntityType.PROJECT_COMMENT,
        entity: comment,
        actionType: CnActivityType.CREATE,
        title: `{{user.name}} has commented on project ${parentFolder.name}`,
        entityName: parentFolder.name
      }
    };
  }

  private projectCommentDeleted(comment: CnProjectComment, parentFolder: CnFolderHierarchy): CnActivityAndNotif {
    return {
      activity: {
        entityType: CnActivityEntityType.PROJECT_COMMENT,
        entity: comment,
        actionType: CnActivityType.DELETE,
        title: `{{user.name}} has deleted comment on project ${parentFolder.name}`,
        entityName: parentFolder.name
      }
    };
  }

  /**
   * Handle notification on comment to send notification to mentioned users
   * @param activity
   * @param comment
   * @param parentFolder
   * @private
   */
  private async handleCommentCreated(activity: CnActivity, comment: CnProjectComment, parentFolder: CnFolderHierarchy): Promise<void> {
    console.log('handle comment')
    const projectUsers = await this.projectUserService.findByRootFolderId(parentFolder.getRootFolderId());

    const link = CnFrontService.getProjectCommentRoute(parentFolder.id);

    const ancestors = await this.folderHierarchyService.getAncestorsByFolderId(parentFolder.id);
    const ancestorIds = ancestors.map(a => a.id);

    const userMentions = this.getUserMentions(comment.content, projectUsers);

    // send notification to mentioned users
    for (const userMention of userMentions) {
    console.log('userMentions', userMention.user.alias);

      await this.sendNotification(userMention,
        activity.user, activity.space.id, activity.entityType, activity.entityId,
        `${comment.createdBy.alias} mentioned you in a comment on project ${parentFolder.name}`,
        link, parentFolder, ancestorIds);
    }

    // send notification to project users
    for (const projectUser of projectUsers) {
      // don't send notification to the user who created the comment and to the mentioned users
      if (projectUser.user.id === activity.user.id || userMentions.find(um => um.user.id == projectUser.user.id)) continue;

      await this.sendNotification(projectUser,
        activity.user, activity.space.id, activity.entityType, activity.entityId, activity.cleanTitle,
        link, parentFolder, ancestorIds);
    }
  }

  private getUserMentions(content: BlRichTextContent, projectUsers: CnProjectUser[]): CnProjectUser[] {

    const richText = new BlNewRichText(content);
    const mentions: BlMentionUser[] = richText.getMentions();

    // exclude current user
    const otherUsers = projectUsers.filter(
      pu => pu.user.id != CnCurrentUserHelper.getCurrentUser().id);

    // if the user selected the special 'Everyone' fake user
    const everyoneUser = getFakeUserEveryoneMention();
    if (mentions.find(mention => mention.id == everyoneUser.id)) {
      return otherUsers;
    }

    const userMentions: CnProjectUser[] = [];
    for (const mention of mentions) {
      const projectUser = projectUsers.find(pu => pu.user.id == mention.id);
      // avoid duplicate
      if (!userMentions.find(um => um.user.id == projectUser.user.id)) {
        userMentions.push(projectUser);
      }
    }

    return userMentions;
  }

  /**
   * On comment delete, delete the notification
   * @param activity
   * @param comment
   * @private
   */
  private async handleCommentDeleted(activity: CnActivity, comment: CnProjectComment): Promise<void> {
    await this.notificationService.deleteNotificationByObject(activity.entityType, comment.id);
  }

  private getNotifMode(projectUser: CnProjectUser, entityType: CnActivityEntityType): CnProjectNotifOptions {
    switch (entityType) {
      case CnActivityEntityType.PROJECT:
        return projectUser.projectNotif;
      case CnActivityEntityType.EXPERIMENT:
        return projectUser.experimentNotif;
      case CnActivityEntityType.REPORT:
        return projectUser.reportNotif;
      case CnActivityEntityType.PROJECT_DOCUMENT:
        return projectUser.documentNotif;
      case CnActivityEntityType.PROJECT_COMMENT:
        return projectUser.commentNotif;
      default:
        return CnProjectNotifOptions.NONE;
    }
  }

  /**
   * Method to update hierarchy object after the object is updated
   * @param event
   * @private
   */
  @OnEvent(cnProjectEventName)
  async updateHierarchyObject(event: CnFolderEvent): Promise<void> {
    const events: CnProjectEventType[] = ['UPDATE_PROJECT', 'UPDATE_PROJECT_LEADER', 'UPDATE_EXPERIMENT', 'UPDATE_REPORT',
      'RENAME_DOCUMENT', 'UPDATE_CONSTELLAB_DOCUMENT'];

    if (!events.includes(event.type)) return;
    if (!(event.entity instanceof CnFolderObject)) return;

    const folderObjectInfo = event.entity.getFolderObjectInfo();
    const folderObjectDb = await this.folderHierarchyService.findByIdAndCheck(event.entity.id);

    folderObjectDb.name = folderObjectInfo.name;
    folderObjectDb.lastModifiedAt = folderObjectInfo.lastModifiedAt;
    folderObjectDb.user = folderObjectInfo.user;
    folderObjectDb.isValidated = folderObjectInfo.isValidated;
    folderObjectDb.documentSize = folderObjectInfo.documentSize;

    await this.folderHierarchyService.update(folderObjectDb);
  }

}
