import { Injectable } from '@nestjs/common';
import { CnFolderUserService } from './cn-folder-user/cn-folder-user.service';
import { OnEvent } from '@nestjs/event-emitter';
import { CnActivityCreateDTO, CnActivityService } from '../cn-activity/cn-activity.service';
import { CnFolderNotifOptions, CnFolderUser } from './cn-folder-user/cn-folder-user.entity';
import { CnActivity, CnActivityEntityType, CnActivityType } from '../cn-activity/cn-activity.entity';
import { CnNotificationService } from '../cn-notification/cn-notification.service';
import { CnFrontService } from '../cn-core/services/cn-front.service';
import { CnFolderEvent, cnFolderEventName, CnFolderEventType } from './cn-folder.event';
import { CnFolder } from './cn-folders/cn-folder.entity';
import { CnUser } from '../cn-users/cn-user.entity';
import { CnExperiment } from './cn-experiments/cn-experiment.entity';
import { CnReport } from './cn-reports/cn-report.entity';
import { CnChatMessage, getFakeUserEveryoneMention } from '../cn-chat-message/cn-chat-message.entity';
import { BlMailService, BlMentionUser, BlNewRichText, BlRichTextContent } from '@monorepo/back-core-lib';
import { CnCurrentUserHelper } from '../cn-core/utils/cn-current-user.helper';
import { CnMailTemplate } from '../cn-core/model/config/cn-mail-template.class';
import { CnDocument } from './cn-documents/cn-document.entity';
import { CnHierarchyObjectService } from './cn_hierarchy_objects/cn-hierarchy-object.service';
import { CnHierarchyObject } from './cn_hierarchy_objects/cn-hierarchy-object.entity';
import { CnHierarchyRepresentation } from './cn_hierarchy_objects/cn-hierarchy-representation';

export interface CnNotifInfo {
  link: string;
}

export interface CnActivityAndNotif {
  activity: CnActivityCreateDTO;
  notif?: CnNotifInfo;
}

@Injectable()
export class CnFolderListener {

  constructor(private folderUserService: CnFolderUserService,
              private folderHierarchyService: CnHierarchyObjectService,
              private notificationService: CnNotificationService,
              private activityService: CnActivityService,
              private mailService: BlMailService,
              private frontService: CnFrontService) {
  }


  @OnEvent(cnFolderEventName)
  async handleFolderEvent(event: CnFolderEvent): Promise<void> {

    const activityAndNotif: CnActivityAndNotif = this.getActivityDTO(event);
    if (activityAndNotif == null) return;

    const activity = await this.createActivity(activityAndNotif.activity, event);

    // specific case for message to handle mentions
    if (event.type === 'CREATE_FOLDER_MESSAGE') {
      await this.handleMessageCreated(activity, event.entity, event.parentFolder);
    } else if (event.type === 'DELETE_FOLDER_MESSAGE') {
      await this.handleMessageDeleted(activity, event.entity);
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
   * Get all user of folder and send notification to user that have notif mode for this entity type
   * @private
   */
  private async createNotification(activity: CnActivity, notifInfo: CnNotifInfo, parentFolder: CnHierarchyObject): Promise<void> {
    if (!parentFolder) return;

    const folderUsers = await this.folderUserService.findByRootFolderId(parentFolder.getRootFolderId());

    let ancestorIds: string[] = [];
    // for delete type, don't store the ancestors
    if (activity.actionType !== CnActivityType.DELETE) {
      const ancestors = await this.folderHierarchyService.getAncestorsByFolderId(parentFolder.id);
      ancestorIds = ancestors.map(a => a.id);
    }

    for (const folderUser of folderUsers) {
      await this.sendNotification(folderUser,
        activity.user, activity.space.id, activity.entityType, activity.entityId,
        activity.cleanTitle, notifInfo.link, parentFolder, ancestorIds);
    }
  }

  /**
   * Send notification to the folder user if notification are activated or the mode
   * @private
   */
  private async sendNotification(folderUser: CnFolderUser,
                                 activityUser: CnUser,
                                 spaceId: string,
                                 entityType: CnActivityEntityType,
                                 entityId: string,
                                 text: string,
                                 appRoute: string,
                                 parentFolder: CnHierarchyObject, ancestorFolderIds: string[]): Promise<void> {
    if (folderUser.userId === activityUser.id) return;

    const notifMode = this.getNotifMode(folderUser, entityType);
    if (notifMode === CnFolderNotifOptions.NONE) return;

    // notif
    if (notifMode === CnFolderNotifOptions.NOTIF_AND_EMAIL || notifMode === CnFolderNotifOptions.NOTIF_ONLY) {
      await this.notificationService.createNotification({
        user: folderUser.user,
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
    if (notifMode === CnFolderNotifOptions.NOTIF_AND_EMAIL || notifMode === CnFolderNotifOptions.EMAIL_ONLY) {
      const fullLink = this.frontService.getBaseWebsiteURL() + '/' + appRoute;
      await this.mailService.sendMailToUser(CnMailTemplate.folder_notification, [folderUser.user],
        {
          content: text,
          user: folderUser.user,
          title: parentFolder.name,
          link: fullLink
        }, text);
    }
  }

  private getActivityDTO(event: CnFolderEvent): CnActivityAndNotif {
    switch (event.type) {
      case 'CREATE_SUB_FOLDER':
        return this.subFolderCreated(event.entity, event.parentFolder);
      case 'UPDATE_FOLDER':
        return this.folderUpdated(event.entity);
      case 'UPDATE_FOLDER_LEADER':
        return this.folderLeaderUpdated(event.entity);
      case 'SHARE_FOLDER':
        return this.folderShared(event.entity, event.parentFolder);
      case 'UNSHARE_FOLDER':
        return this.folderUnshared(event.entity, event.parentFolder);
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
      case 'UPLOAD_FOLDER_DOCUMENT':
        return this.documentCreated(event.entity, event.parentFolder);
      case 'DELETE_FOLDER_DOCUMENT':
        return this.documentDeleted(event.entity, event.parentFolder);
      case 'CREATE_FOLDER_MESSAGE':
        return this.messageCreated(event.entity, event.parentFolder);
      case 'DELETE_FOLDER_MESSAGE':
        return this.messageDeleted(event.entity, event.parentFolder);
      default:
        return null;
    }
  }


  private subFolderCreated(folder: CnFolder, parentFolder: CnHierarchyObject): CnActivityAndNotif {
    return {
      activity: {
        entityType: CnActivityEntityType.FOLDER,
        entity: folder,
        actionType: CnActivityType.CREATE,
        title: `{{user.name}} has created sub folder ${folder.title} under folder ${parentFolder.name}`,
        entityName: folder.title
      }, notif: { link: CnFrontService.getFolderRoute(folder.id) }
    };
  }

  private folderUpdated(folder: CnFolder): CnActivityAndNotif {
    return {
      activity: {
        entityType: CnActivityEntityType.FOLDER,
        entity: folder,
        actionType: CnActivityType.UPDATE,
        title: `{{user.name}} has updated folder ${folder.title}`,
        entityName: folder.title
      }, notif: { link: CnFrontService.getFolderRoute(folder.id) }
    };
  }

  private folderLeaderUpdated(folder: CnFolder): CnActivityAndNotif {
    return {
      activity: {
        entityType: CnActivityEntityType.FOLDER,
        entity: folder,
        actionType: CnActivityType.UPDATE,
        title: `{{user.name}} has changed leader of folder ${folder.title} to ${folder.leader.alias}`,
        entityName: folder.title
      }, notif: { link: CnFrontService.getFolderRoute(folder.id) }
    };
  }

  private folderShared(users: CnUser[], parentFolder: CnHierarchyObject): CnActivityAndNotif {
    const userText = users.length === 1 ? users[0].alias : `${users.length} users`;
    return {
      activity: {
        entityType: CnActivityEntityType.FOLDER,
        entity: parentFolder,
        actionType: CnActivityType.UPDATE,
        title: `{{user.name}} added ${userText} to folder ${parentFolder.name}`,
        entityName: parentFolder.name
      }, notif: { link: CnFrontService.getFolderRoute(parentFolder.id) }
    };
  }

  private folderUnshared(user: CnUser, parentFolder: CnHierarchyObject): CnActivityAndNotif {
    return {
      activity: {
        entityType: CnActivityEntityType.FOLDER,
        entity: parentFolder,
        actionType: CnActivityType.UPDATE,
        title: `{{user.name}} removed ${user.alias} from folder ${parentFolder.name}`,
        entityName: parentFolder.name
      }, notif: { link: CnFrontService.getFolderRoute(parentFolder.id) }
    };
  }

  private experimentCreated(experiment: CnExperiment, parentFolder: CnHierarchyObject): CnActivityAndNotif {
    return {
      activity: {
        entityType: CnActivityEntityType.EXPERIMENT,
        entity: experiment,
        actionType: CnActivityType.CREATE,
        title: `{{user.name}} has created experiment ${experiment.title} under folder ${parentFolder.name}`,
        entityName: experiment.title
      }, notif: { link: CnFrontService.getExperimentRoute(experiment.id) }
    };
  }

  private experimentUpdated(experiment: CnExperiment, parentFolder: CnHierarchyObject): CnActivityAndNotif {
    return {
      activity: {
        entityType: CnActivityEntityType.EXPERIMENT,
        entity: experiment,
        actionType: CnActivityType.UPDATE,
        title: `{{user.name}} has updated experiment ${experiment.title} under folder ${parentFolder.name}`,
        entityName: experiment.title
      }, notif: { link: CnFrontService.getExperimentRoute(experiment.id) }
    };
  }

  private experimentDeleted(experiment: CnExperiment, parentFolder: CnHierarchyObject): CnActivityAndNotif {
    return {
      activity: {
        entityType: CnActivityEntityType.EXPERIMENT,
        entity: experiment,
        actionType: CnActivityType.DELETE,
        title: `{{user.name}} has deleted experiment ${experiment.title} under folder ${parentFolder.name}`,
        entityName: experiment.title
      }, notif: { link: CnFrontService.getFolderRoute(parentFolder.id) }
    };
  }

  private reportCreated(report: CnReport, parentFolder: CnHierarchyObject): CnActivityAndNotif {
    return {
      activity: {
        entityType: CnActivityEntityType.REPORT,
        entity: report,
        actionType: CnActivityType.CREATE,
        title: `{{user.name}} has created report ${report.title} under folder ${parentFolder.name}`,
        entityName: report.title
      }, notif: { link: CnFrontService.getReportRoute(report.id) }
    };
  }

  private reportUpdated(report: CnReport, parentFolder: CnHierarchyObject): CnActivityAndNotif {
    return {
      activity: {
        entityType: CnActivityEntityType.REPORT,
        entity: report,
        actionType: CnActivityType.UPDATE,
        title: `{{user.name}} has updated report ${report.title} under folder ${parentFolder.name}`,
        entityName: report.title
      }, notif: { link: CnFrontService.getReportRoute(report.id) }
    };
  }

  private reportDeleted(report: CnReport, parentFolder: CnHierarchyObject): CnActivityAndNotif {
    return {
      activity: {
        entityType: CnActivityEntityType.REPORT,
        entity: report,
        actionType: CnActivityType.DELETE,
        title: `{{user.name}} has deleted report ${report.title} under folder ${parentFolder.name}`,
        entityName: report.title
      }, notif: { link: CnFrontService.getFolderRoute(parentFolder.id) }
    };
  }

  private constellabDocCreated(document: CnDocument): CnActivityAndNotif {
    return {
      activity: {
        entityType: CnActivityEntityType.DOCUMENT,
        entity: document,
        actionType: CnActivityType.CREATE,
        title: `{{user.name}} has created constellab document ${document.name}`,
        entityName: document.name
      }, notif: { link: CnFrontService.getConstellabDocRoute(document.id) }
    };
  }


  private documentCreated(document: CnDocument, parentFolder: CnHierarchyObject): CnActivityAndNotif {
    return {
      activity: {
        entityType: CnActivityEntityType.DOCUMENT,
        entity: document,
        actionType: CnActivityType.CREATE,
        title: `{{user.name}} has uploaded document ${document.name}`,
        entityName: document.name
      }, notif: { link: CnFrontService.getFolderRoute(parentFolder.id) }
    };
  }

  private documentDeleted(document: CnDocument, parentFolder: CnHierarchyObject): CnActivityAndNotif {
    return {
      activity: {
        entityType: CnActivityEntityType.DOCUMENT,
        entity: document,
        actionType: CnActivityType.DELETE,
        title: `{{user.name}} has deleted document ${document.name}`,
        entityName: document.name
      }, notif: { link: CnFrontService.getFolderRoute(parentFolder.id) }
    };
  }

  private messageCreated(message: CnChatMessage, parentFolder: CnHierarchyObject): CnActivityAndNotif {
    return {
      activity: {
        entityType: CnActivityEntityType.MESSAGE,
        entity: message,
        actionType: CnActivityType.CREATE,
        title: `{{user.name}} has send a message on folder ${parentFolder.name}`,
        entityName: parentFolder.name
      }
    };
  }

  private messageDeleted(message: CnChatMessage, parentFolder: CnHierarchyObject): CnActivityAndNotif {
    return {
      activity: {
        entityType: CnActivityEntityType.MESSAGE,
        entity: message,
        actionType: CnActivityType.DELETE,
        title: `{{user.name}} has deleted a message on folder ${parentFolder.name}`,
        entityName: parentFolder.name
      }
    };
  }

  /**
   * Handle notification on message to send notification to mentioned users
   * @param activity
   * @param message
   * @param parentFolder
   * @private
   */
  private async handleMessageCreated(activity: CnActivity, message: CnChatMessage, parentFolder: CnHierarchyObject): Promise<void> {
    const folderUsers = await this.folderUserService.findByRootFolderId(parentFolder.getRootFolderId());

    const link = CnFrontService.getChatMessageRoute(parentFolder.id);

    const ancestors = await this.folderHierarchyService.getAncestorsByFolderId(parentFolder.id);
    const ancestorIds = ancestors.map(a => a.id);

    const userMentions = this.getUserMentions(message.content, folderUsers);

    // send notification to mentioned users
    for (const userMention of userMentions) {

      await this.sendNotification(userMention,
        activity.user, activity.space.id, activity.entityType, activity.entityId,
        `${message.createdBy.alias} mentioned you in a message on folder ${parentFolder.name}`,
        link, parentFolder, ancestorIds);
    }

    // send notification to folder users
    for (const folderUser of folderUsers) {
      // don't send notification to the user who created the message and to the mentioned users
      if (folderUser.user.id === activity.user.id || userMentions.find(um => um.user.id == folderUser.user.id)) continue;

      await this.sendNotification(folderUser,
        activity.user, activity.space.id, activity.entityType, activity.entityId, activity.cleanTitle,
        link, parentFolder, ancestorIds);
    }
  }

  private getUserMentions(content: BlRichTextContent, folderUsers: CnFolderUser[]): CnFolderUser[] {

    const richText = new BlNewRichText(content);
    const mentions: BlMentionUser[] = richText.getMentions();

    // exclude current user
    const otherUsers = folderUsers.filter(
      pu => pu.user.id != CnCurrentUserHelper.getCurrentUser().id);

    // if the user selected the special 'Everyone' fake user
    const everyoneUser = getFakeUserEveryoneMention();
    if (mentions.find(mention => mention.id == everyoneUser.id)) {
      return otherUsers;
    }

    const userMentions: CnFolderUser[] = [];
    for (const mention of mentions) {
      const folderUser = folderUsers.find(pu => pu.user.id == mention.id);
      // avoid duplicate
      if (!userMentions.find(um => um.user.id == folderUser.user.id)) {
        userMentions.push(folderUser);
      }
    }

    return userMentions;
  }

  /**
   * On message delete, delete the notification
   * @param activity
   * @param message
   * @private
   */
  private async handleMessageDeleted(activity: CnActivity, message: CnChatMessage): Promise<void> {
    await this.notificationService.deleteNotificationByObject(activity.entityType, message.id);
  }

  private getNotifMode(folderUser: CnFolderUser, entityType: CnActivityEntityType): CnFolderNotifOptions {
    switch (entityType) {
      case CnActivityEntityType.FOLDER:
        return folderUser.folderNotif;
      case CnActivityEntityType.EXPERIMENT:
        return folderUser.experimentNotif;
      case CnActivityEntityType.REPORT:
        return folderUser.reportNotif;
      case CnActivityEntityType.DOCUMENT:
        return folderUser.documentNotif;
      case CnActivityEntityType.MESSAGE:
        return folderUser.messageNotif;
      default:
        return CnFolderNotifOptions.NONE;
    }
  }

  /**
   * Method to update hierarchy object after the object is updated
   * @param event
   * @private
   */
  @OnEvent(cnFolderEventName)
  async updateHierarchyObject(event: CnFolderEvent): Promise<void> {
    const events: CnFolderEventType[] = ['UPDATE_FOLDER', 'UPDATE_FOLDER_LEADER', 'UPDATE_EXPERIMENT', 'UPDATE_REPORT',
      'RENAME_DOCUMENT', 'UPDATE_CONSTELLAB_DOCUMENT'];

    if (!events.includes(event.type)) return;
    if (!(event.entity instanceof CnHierarchyRepresentation)) return;

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
