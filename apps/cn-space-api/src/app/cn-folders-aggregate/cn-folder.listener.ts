import { Injectable, Logger } from '@nestjs/common';
import { CnFolderUserService } from './cn-folder-user/cn-folder-user.service';
import { OnEvent } from '@nestjs/event-emitter';
import { CnActivityCreateDTO, CnActivityService } from '../cn-activity/cn-activity.service';
import { CnFolderUser, CnRootFolderNotifOptions } from './cn-folder-user/cn-folder-user.entity';
import { CnActivity, CnActivityEntityType, CnActivityType } from '../cn-activity/cn-activity.entity';
import { CnNotificationService } from '../cn-notification/cn-notification.service';
import { CnFrontService } from '../cn-core/services/cn-front.service';
import { CnFolderEvent, cnFolderEventName, CnFolderEventType } from './cn-folder.event';
import { CnFolder } from './cn-folders/cn-folder.entity';
import { CnUser } from '../cn-users/cn-user.entity';
import { CnScenario } from './cn-scenarios/cn-scenario.entity';
import { CnNote } from './cn-notes/cn-note.entity';
import { CnChatMessage, getFakeUserEveryoneMention } from './cn-chat/cn-chat-message.entity';
import { BlMailService } from '@monorepo/back-core-lib';
import { CnCurrentUserHelper } from '../cn-core/utils/cn-current-user.helper';
import { CnMailTemplate } from '../cn-core/model/config/cn-mail-template.class';
import { CnDocument } from './cn-documents/cn-document.entity';
import { CnHierarchyObjectService } from './cn-hierarchy-objects/cn-hierarchy-object.service';
import { CnHierarchyObject } from './cn-hierarchy-objects/cn-hierarchy-object.entity';
import { CnHierarchyRepresentation } from './cn-hierarchy-objects/cn-hierarchy-representation';
import { CnSpaceEvent, cnSpaceEventName } from '../cn-spaces/cn-space.event';
import { CnFolderAggregateService } from './cn-folder-aggregate.service';
import { TeMentionUser, TeRichText, TeRichTextMentionHelper } from '@monorepo/te-text-editor';
import { CnHierarchyObjectTagAggregateService } from './cn-hierarchy-object-tags/cn-hierarchy-object-tag-aggregate.service';

export interface CnNotifInfo {
  link: string;
}

export interface CnActivityAndNotif {
  activity: CnActivityCreateDTO;
  notif?: CnNotifInfo;
}

@Injectable()
export class CnFolderListener {
  protected readonly logger = new Logger(CnFolderListener.name);

  constructor(
    private folderUserService: CnFolderUserService,
    private hierarchyObjectService: CnHierarchyObjectService,
    private notificationService: CnNotificationService,
    private activityService: CnActivityService,
    private mailService: BlMailService,
    private frontService: CnFrontService,
    private folderAggregateService: CnFolderAggregateService,
    private hierarchyObjectTagService: CnHierarchyObjectTagAggregateService
  ) {}

  @OnEvent(cnFolderEventName)
  async handleFolderEvent(event: CnFolderEvent): Promise<void> {
    try {
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
    } catch (error: any) {
      this.logger.error(`[CnFolderListener] Error while handling folder event ${event.type}. Error ${error}`);
      if (error.stack) {
        this.logger.error(error.stack);
      }
      throw error;
    }
  }

  private async createActivity(activityDTO: CnActivityCreateDTO, event: CnFolderEvent): Promise<CnActivity> {
    activityDTO.user = event.user;
    activityDTO.space = event.space;
    activityDTO.parentEntityId = event.parentFolder?.id;

    return await this.activityService.create(activityDTO);
  }

  /**
   * Get all user of folder and send notification to user that have notif mode for this entity type
   * @private
   */
  private async createNotification(
    activity: CnActivity,
    notifInfo: CnNotifInfo,
    parentFolder: CnHierarchyObject
  ): Promise<void> {
    if (!parentFolder) return;

    const folderUsers = await this.folderUserService.findByRootFolderId(parentFolder.getRootFolderId());

    let ancestorIds: string[] = [];
    // for delete type, don't store the ancestors
    if (activity.actionType !== CnActivityType.DELETE) {
      const ancestors = await this.hierarchyObjectService.getAncestorsByFolderId(parentFolder.id);
      ancestorIds = ancestors.map((a) => a.id);
    }

    for (const folderUser of folderUsers) {
      await this.sendNotification(
        folderUser,
        activity.user,
        activity.space.id,
        activity.entityType,
        activity.entityId,
        activity.cleanTitle,
        notifInfo.link,
        parentFolder,
        ancestorIds
      );
    }
  }

  /**
   * Send notification to the folder user if notification are activated or the mode
   * @private
   */
  private async sendNotification(
    folderUser: CnFolderUser,
    activityUser: CnUser,
    spaceId: string,
    entityType: CnActivityEntityType,
    entityId: string,
    text: string,
    appRoute: string,
    parentFolder: CnHierarchyObject,
    ancestorFolderIds: string[]
  ): Promise<void> {
    if (folderUser.userId === activityUser.id) return;

    const notifMode = this.getNotifMode(folderUser, entityType);
    if (notifMode === CnRootFolderNotifOptions.NONE) return;

    // notif
    if (
      notifMode === CnRootFolderNotifOptions.NOTIF_AND_EMAIL ||
      notifMode === CnRootFolderNotifOptions.NOTIF_ONLY
    ) {
      await this.notificationService.createNotification({
        user: folderUser.user,
        link: appRoute,
        spaceId: spaceId,
        createdBy: activityUser,
        objectType: entityType,
        text: text,
        text2: parentFolder.name,
        objectId: entityId,
        associatedObjectIds: ancestorFolderIds,
      });
    }

    // mail
    if (
      notifMode === CnRootFolderNotifOptions.NOTIF_AND_EMAIL ||
      notifMode === CnRootFolderNotifOptions.EMAIL_ONLY
    ) {
      const fullLink = this.frontService.getBaseWebsiteURL() + '/' + appRoute;
      await this.mailService.sendMailToUser(
        CnMailTemplate.folder_notification,
        [folderUser.user],
        {
          content: text,
          user: {
            firstname: folderUser.user.firstname,
            lastname: folderUser.user.lastname,
          },
          title: parentFolder.name,
          link: fullLink,
        },
        text
      );
    }
  }

  private getActivityDTO(event: CnFolderEvent): CnActivityAndNotif {
    switch (event.type) {
      case 'CREATE_SUB_FOLDER':
        return this.subFolderCreated(event.entity, event.parentFolder);
      case 'UPDATE_FOLDER':
        return this.folderUpdated(event.entity);
      case 'SHARE_FOLDER':
        return this.folderShared(event.entity, event.parentFolder);
      case 'UNSHARE_FOLDER':
        return this.folderUnshared(event.entity, event.parentFolder);
      case 'MOVE_OBJECT_TO_FOLDER':
        return this.hierarchyObjectMovedToFolder(event.entity, event.parentFolder);
      case 'MOVE_OBJECT_TO_TRASH':
        return this.hierarchyObjectMovedToTrash(event.entity, event.parentFolder);
      case 'RESTORE_OBJECT_FROM_TRASH':
        return this.hierarchyObjectRestoredFromTrash(event.entity, event.parentFolder);
      case 'DELETE_OBJECT':
        return this.hierarchyObjectDeleted(event.entity, event.parentFolder);
      case 'EMPTY_TRASH':
        return this.emptyFolderTrash(event.parentFolder);
      case 'CREATE_SCENARIO':
        return this.scenarioCreated(event.entity, event.parentFolder);
      case 'UPDATE_SCENARIO':
        return this.scenarioUpdated(event.entity, event.parentFolder);
      case 'CREATE_NOTE':
        return this.noteCreated(event.entity, event.parentFolder);
      case 'UPDATE_NOTE':
        return this.noteUpdated(event.entity, event.parentFolder);
      case 'CREATE_CONSTELLAB_DOCUMENT':
        return this.constellabDocCreated(event.entity);
      case 'UPLOAD_FOLDER_DOCUMENT':
        return this.documentCreated(event.entity, event.parentFolder);
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
        title: `{{user.name}} has created sub folder ${folder.name} under folder ${parentFolder.name}`,
        entityName: folder.name,
      },
      notif: { link: CnFrontService.getFolderRoute(folder.id) },
    };
  }

  private folderUpdated(folder: CnFolder): CnActivityAndNotif {
    return {
      activity: {
        entityType: CnActivityEntityType.FOLDER,
        entity: folder,
        actionType: CnActivityType.UPDATE,
        title: `{{user.name}} has updated folder ${folder.name}`,
        entityName: folder.name,
      },
      notif: { link: CnFrontService.getFolderRoute(folder.id) },
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
        entityName: parentFolder.name,
      },
      notif: { link: CnFrontService.getFolderRoute(parentFolder.id) },
    };
  }

  private folderUnshared(user: CnUser, parentFolder: CnHierarchyObject): CnActivityAndNotif {
    return {
      activity: {
        entityType: CnActivityEntityType.FOLDER,
        entity: parentFolder,
        actionType: CnActivityType.UPDATE,
        title: `{{user.name}} removed ${user.alias} from folder ${parentFolder.name}`,
        entityName: parentFolder.name,
      },
      notif: { link: CnFrontService.getFolderRoute(parentFolder.id) },
    };
  }

  ///////////////////////////// HIERARCHY OBJECTS /////////////////////////////
  private hierarchyObjectMovedToFolder(
    hierarchyObject: CnHierarchyObject,
    parentFolder: CnHierarchyObject
  ): CnActivityAndNotif {
    return {
      activity: {
        entityType: hierarchyObject.getActivityEntityType(),
        entity: hierarchyObject,
        actionType: CnActivityType.UPDATE,
        title:
          `{{user.name}} has moved the ${hierarchyObject.getObjectTypeName()} ` +
          `${hierarchyObject.name} to folder ${parentFolder.name}`,
        entityName: hierarchyObject.name,
      },
      notif: { link: CnFrontService.getFolderRoute(parentFolder.id) },
    };
  }

  private hierarchyObjectMovedToTrash(
    hierarchyObject: CnHierarchyObject,
    parentFolder?: CnHierarchyObject
  ): CnActivityAndNotif {
    return {
      activity: {
        entityType: hierarchyObject.getActivityEntityType(),
        entity: hierarchyObject,
        actionType: CnActivityType.TRASH,
        title:
          `{{user.name}} has moved the ${this.getHierarchyObjectInfoStr(hierarchyObject, parentFolder)} ` +
          `to trash`,
        entityName: hierarchyObject.name,
      },
      notif: {
        link: parentFolder
          ? CnFrontService.getFolderRoute(parentFolder.id)
          : CnFrontService.getFoldersRoute(),
      },
    };
  }

  private hierarchyObjectRestoredFromTrash(
    hierarchyObject: CnHierarchyObject,
    parentFolder?: CnHierarchyObject
  ): CnActivityAndNotif {
    return {
      activity: {
        entityType: hierarchyObject.getActivityEntityType(),
        entity: hierarchyObject,
        actionType: CnActivityType.TRASH,
        title:
          `{{user.name}} has restored the ${this.getHierarchyObjectInfoStr(hierarchyObject, parentFolder)} ` +
          `from trash`,
        entityName: hierarchyObject.name,
      },
      notif: { link: hierarchyObject.getFrontRoute() },
    };
  }

  private hierarchyObjectDeleted(
    hierarchyObject: CnHierarchyObject,
    parentFolder?: CnHierarchyObject
  ): CnActivityAndNotif {
    return {
      activity: {
        entityType: hierarchyObject.getActivityEntityType(),
        entity: hierarchyObject,
        actionType: CnActivityType.DELETE,
        title:
          '{{user.name}} has deleted the ' + this.getHierarchyObjectInfoStr(hierarchyObject, parentFolder),
        entityName: hierarchyObject.name,
      },
    };
  }

  private getHierarchyObjectInfoStr(
    hierarchyObject: CnHierarchyObject,
    parentFolder: CnHierarchyObject
  ): string {
    let text = `${hierarchyObject.getObjectTypeName()} ${hierarchyObject.name}`;
    if (parentFolder) {
      text += ` under folder ${parentFolder.name}`;
    }
    return text;
  }

  private emptyFolderTrash(parentFolder: CnHierarchyObject): CnActivityAndNotif {
    return {
      activity: {
        entityType: CnActivityEntityType.FOLDER,
        entity: parentFolder,
        actionType: CnActivityType.TRASH,
        title: `{{user.name}} has emptied the trash of folder ${parentFolder.name}`,
        entityName: parentFolder.name,
      },
      notif: { link: CnFrontService.getFolderRoute(parentFolder.id) },
    };
  }

  private scenarioCreated(scenario: CnScenario, parentFolder: CnHierarchyObject): CnActivityAndNotif {
    return {
      activity: {
        entityType: CnActivityEntityType.SCENARIO,
        entity: scenario,
        actionType: CnActivityType.CREATE,
        title: `{{user.name}} has created scenario ${scenario.title} under folder ${parentFolder.name}`,
        entityName: scenario.title,
      },
      notif: { link: CnFrontService.getScenarioRoute(scenario.id) },
    };
  }

  private scenarioUpdated(scenario: CnScenario, parentFolder: CnHierarchyObject): CnActivityAndNotif {
    return {
      activity: {
        entityType: CnActivityEntityType.SCENARIO,
        entity: scenario,
        actionType: CnActivityType.UPDATE,
        title: `{{user.name}} has updated scenario ${scenario.title} under folder ${parentFolder.name}`,
        entityName: scenario.title,
      },
      notif: { link: CnFrontService.getScenarioRoute(scenario.id) },
    };
  }

  private noteCreated(note: CnNote, parentFolder: CnHierarchyObject): CnActivityAndNotif {
    return {
      activity: {
        entityType: CnActivityEntityType.NOTE,
        entity: note,
        actionType: CnActivityType.CREATE,
        title: `{{user.name}} has created note ${note.title} under folder ${parentFolder.name}`,
        entityName: note.title,
      },
      notif: { link: CnFrontService.getNoteRoute(note.id) },
    };
  }

  private noteUpdated(note: CnNote, parentFolder: CnHierarchyObject): CnActivityAndNotif {
    return {
      activity: {
        entityType: CnActivityEntityType.NOTE,
        entity: note,
        actionType: CnActivityType.UPDATE,
        title: `{{user.name}} has updated note ${note.title} under folder ${parentFolder.name}`,
        entityName: note.title,
      },
      notif: { link: CnFrontService.getNoteRoute(note.id) },
    };
  }

  private constellabDocCreated(document: CnDocument): CnActivityAndNotif {
    return {
      activity: {
        entityType: CnActivityEntityType.DOCUMENT,
        entity: document,
        actionType: CnActivityType.CREATE,
        title: `{{user.name}} has created constellab document ${document.name}`,
        entityName: document.name,
      },
      notif: { link: CnFrontService.getConstellabDocRoute(document.id) },
    };
  }

  private documentCreated(document: CnDocument, parentFolder: CnHierarchyObject): CnActivityAndNotif {
    return {
      activity: {
        entityType: CnActivityEntityType.DOCUMENT,
        entity: document,
        actionType: CnActivityType.CREATE,
        title: `{{user.name}} has uploaded document ${document.name}`,
        entityName: document.name,
      },
      notif: { link: CnFrontService.getFolderRoute(parentFolder.id) },
    };
  }

  private messageCreated(message: CnChatMessage, parentFolder: CnHierarchyObject): CnActivityAndNotif {
    return {
      activity: {
        entityType: CnActivityEntityType.MESSAGE,
        entity: message,
        actionType: CnActivityType.CREATE,
        title: `{{user.name}} has send a message on folder ${parentFolder.name}`,
        entityName: parentFolder.name,
      },
    };
  }

  private messageDeleted(message: CnChatMessage, parentFolder: CnHierarchyObject): CnActivityAndNotif {
    return {
      activity: {
        entityType: CnActivityEntityType.MESSAGE,
        entity: message,
        actionType: CnActivityType.DELETE,
        title: `{{user.name}} has deleted a message on folder ${parentFolder.name}`,
        entityName: parentFolder.name,
      },
    };
  }

  /**
   * Handle notification on message to send notification to mentioned users
   * @param activity
   * @param message
   * @param parentFolder
   * @private
   */
  private async handleMessageCreated(
    activity: CnActivity,
    message: CnChatMessage,
    parentFolder: CnHierarchyObject
  ): Promise<void> {
    const folderUsers = await this.folderUserService.findByRootFolderId(parentFolder.getRootFolderId());

    const link = CnFrontService.getChatMessageRoute(parentFolder.id);

    const ancestors = await this.hierarchyObjectService.getAncestorsByFolderId(parentFolder.id);
    const ancestorIds = ancestors.map((a) => a.id);

    const userMentions = this.getUserMentions(message.getRichTextContent(), folderUsers);

    // send notification to mentioned users
    for (const userMention of userMentions) {
      await this.sendNotification(
        userMention,
        activity.user,
        activity.space.id,
        activity.entityType,
        activity.entityId,
        `${message.createdBy.alias} mentioned you in a message on folder ${parentFolder.name}`,
        link,
        parentFolder,
        ancestorIds
      );
    }

    // send notification to folder users
    for (const folderUser of folderUsers) {
      // don't send notification to the user who created the message and to the mentioned users
      if (
        folderUser.user.id === activity.user.id ||
        userMentions.find((um) => um.user.id == folderUser.user.id)
      )
        continue;

      await this.sendNotification(
        folderUser,
        activity.user,
        activity.space.id,
        activity.entityType,
        activity.entityId,
        activity.cleanTitle,
        link,
        parentFolder,
        ancestorIds
      );
    }
  }

  private getUserMentions(richText: TeRichText, folderUsers: CnFolderUser[]): CnFolderUser[] {
    const mentions: TeMentionUser[] = TeRichTextMentionHelper.getMentions(richText);

    // exclude current user
    const otherUsers = folderUsers.filter(
      (pu) => pu.user.id != CnCurrentUserHelper.getAndCheckCurrentUser().id
    );

    // if the user selected the special 'Everyone' fake user
    const everyoneUser = getFakeUserEveryoneMention();
    if (mentions.find((mention) => mention.id == everyoneUser.id)) {
      return otherUsers;
    }

    const userMentions: CnFolderUser[] = [];
    for (const mention of mentions) {
      const folderUser = folderUsers.find((pu) => pu.user.id == mention.id);
      // avoid duplicate
      if (!userMentions.find((um) => um.user.id == folderUser.user.id)) {
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

  private getNotifMode(folderUser: CnFolderUser, entityType: CnActivityEntityType): CnRootFolderNotifOptions {
    switch (entityType) {
      case CnActivityEntityType.FOLDER:
        return folderUser.folderNotif;
      case CnActivityEntityType.SCENARIO:
        return folderUser.scenarioNotif;
      case CnActivityEntityType.NOTE:
        return folderUser.noteNotif;
      case CnActivityEntityType.DOCUMENT:
        return folderUser.documentNotif;
      case CnActivityEntityType.MESSAGE:
        return folderUser.messageNotif;
      default:
        return CnRootFolderNotifOptions.NONE;
    }
  }

  /**
   * Method to update hierarchy object after the object is updated
   * @param event
   * @private
   */
  @OnEvent(cnFolderEventName)
  async updateHierarchyObject(event: CnFolderEvent): Promise<void> {
    const events: CnFolderEventType[] = [
      'UPDATE_FOLDER',
      'UPDATE_SCENARIO',
      'UPDATE_NOTE',
      'RENAME_DOCUMENT',
      'RENAME_RESOURCE',
      'UPDATE_CONSTELLAB_DOCUMENT',
    ];

    if (!events.includes(event.type)) return;
    if (!(event.entity instanceof CnHierarchyRepresentation)) return;

    const objectInfo = event.entity.getHierarchyObjectInfo();
    const folderObjectDb = await this.hierarchyObjectService.findByIdAndCheck(event.entity.id);

    folderObjectDb.setObjectInfo(objectInfo);
    await this.hierarchyObjectService.update(folderObjectDb);
  }

  @OnEvent(cnFolderEventName)
  async handleHierarchyObjectEvent(event: CnFolderEvent): Promise<void> {
    if (event.type === 'OBJECT_TAG_MODIFIED') {
      await this.refreshHierarchyObjectLastTags(event.entity);
    }
  }

  /**
   * Store the last 4 tags of the hierarchy object in the hierarchy object directly
   * @param hierarchyObject
   * @private
   */
  private async refreshHierarchyObjectLastTags(hierarchyObject: CnHierarchyObject): Promise<void> {
    const tags = await this.hierarchyObjectTagService.findByHierarchyObjectPaginated(hierarchyObject, 0, 4);
    await this.hierarchyObjectService.updateLastTags(hierarchyObject, tags.objects);
  }

  @OnEvent(cnSpaceEventName)
  async handleSpaceEvent(event: CnSpaceEvent): Promise<Error | null> {
    if (event.type === 'REMOVE_USER_FROM_SPACE') {
      return await this.folderAggregateService
        .unshareAllFolderForUser(event.userId, event.spaceId)
        .catch((err) => err);
    }

    return null;
  }
}
