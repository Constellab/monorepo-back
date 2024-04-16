import {Injectable} from '@nestjs/common';
import {CnProjectUserService} from './cn-project-user/cn-project-user.service';
import {OnEvent} from '@nestjs/event-emitter';
import {CnActivityCreateDTO, CnActivityService} from '../cn-activity/cn-activity.service';
import {CnProjectNotifOptions, CnProjectUser} from './cn-project-user/cn-project-user.entity';
import {CnActivity, CnActivityEntityType, CnActivityType} from '../cn-activity/cn-activity.entity';
import {CnNotificationService} from '../cn-notification/cn-notification.service';
import {CnFrontService} from '../cn-core/services/cn-front.service';
import {CnProjectEvent, cnProjectEventName} from './cn-project.event';
import {CnProject} from './cn-projects/cn-project.entity';
import {CnUser} from '../cn-users/cn-user.entity';
import {CnExperiment} from './cn-experiments/cn-experiment.entity';
import {CnReport} from './cn-reports/cn-report.entity';
import {CnProjectComment} from '../cn-project-comment/cn-project-comment.entity';
import {BlMailService, BlRichText, BlRichTextI} from '@monorepo/back-core-lib';
import {CnCurrentUserHelper} from '../cn-core/utils/cn-current-user.helper';
import {CnProjectsService} from './cn-projects/cn-projects.service';
import {CnMailTemplate} from '../cn-core/model/config/cn-mail-template.class';
import {CnProjectDocument} from './cn-project-documents/cn-project-document.entity';

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
              private projectService: CnProjectsService,
              private notificationService: CnNotificationService,
              private activityService: CnActivityService,
              private mailService: BlMailService,
              private frontService: CnFrontService) {
  }


  @OnEvent(cnProjectEventName)
  async handleProjectEvent(event: CnProjectEvent): Promise<void> {

    const activityAndNotif: CnActivityAndNotif = this.getActivityDTO(event);
    if (activityAndNotif == null) return;

    const activity = await this.createActivity(activityAndNotif.activity, event);

    // specific case for comment to handle mentions
    if (event.type === 'CREATE_PROJECT_COMMENT') {
      await this.handleCommentCreated(activity, event.entity, event.parentProject);
    } else if (activityAndNotif.notif) {
      await this.createNotification(activity, activityAndNotif.notif, event.parentProject);
    }
  }

  private async createActivity(activityDTO: CnActivityCreateDTO, event: CnProjectEvent): Promise<CnActivity> {
    activityDTO.user = event.userInfo.user;
    activityDTO.space = event.userInfo.space;
    activityDTO.parentEntityId = event.parentProject.id;

    return await this.activityService.create(activityDTO);
  }

  /**
   * Get all user of project and send notification to user that have notif mode for this entity type
   * @private
   */
  private async createNotification(activity: CnActivity, notifInfo: CnNotifInfo, parentProject: CnProject): Promise<void> {
    if (!parentProject) return;

    const projectUsers = await this.projectUserService.findByProjectId(parentProject.getRootParentId());

    let ancestorIds: string[] = [];
    // for delete type, don't store the ancestors
    if (activity.actionType !== CnActivityType.DELETE) {
      const ancestors = await this.projectService.getAncestors(parentProject);
      ancestorIds = ancestors.map(a => a.id);
    }

    for (const projectUser of projectUsers) {
      await this.sendNotification(projectUser,
        activity.user, activity.space.id, activity.entityType, activity.entityId,
        activity.cleanTitle, notifInfo.link, parentProject, ancestorIds);
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
                                 parentProject: CnProject, ancestorProjectIds: string[]): Promise<void> {
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
        text2: parentProject.title,
        objectId: entityId,
        associatedObjectIds: ancestorProjectIds
      });
    }

    // mail
    if (notifMode === CnProjectNotifOptions.NOTIF_AND_EMAIL || notifMode === CnProjectNotifOptions.EMAIL_ONLY) {
      const fullLink = this.frontService.getBaseWebsiteURL() + '/' + appRoute;
      await this.mailService.sendMailToUser(CnMailTemplate.project_notification, [projectUser.user],
        {
          content: text,
          user: projectUser.user,
          title: parentProject.title,
          link: fullLink
        }, text);
    }
  }

  private getActivityDTO(event: CnProjectEvent): CnActivityAndNotif {
    switch (event.type) {
      case 'CREATE_SUB_PROJECT':
        return this.subProjectCreated(event.entity, event.parentProject);
      case 'UPDATE_PROJECT':
        return this.projectUpdated(event.entity);
      case 'UPDATE_PROJECT_LEADER':
        return this.projectLeaderUpdated(event.entity);
      case 'UPDATE_PROJECT_STATUS':
        return this.projectStatusUpdated(event.entity);
      case 'SHARE_PROJECT':
        return this.projectShared(event.entity, event.parentProject);
      case 'UNSHARE_PROJECT':
        return this.projectUnshared(event.entity, event.parentProject);
      case 'CREATE_EXPERIMENT':
        return this.experimentCreated(event.entity, event.parentProject);
      case 'UPDATE_EXPERIMENT':
        return this.experimentUpdated(event.entity, event.parentProject);
      case 'DELETE_EXPERIMENT':
        return this.experimentDeleted(event.entity, event.parentProject);
      case 'CREATE_REPORT':
        return this.reportCreated(event.entity, event.parentProject);
      case 'UPDATE_REPORT':
        return this.reportUpdated(event.entity, event.parentProject);
      case 'DELETE_REPORT':
        return this.reportDeleted(event.entity, event.parentProject);
      case 'CREATE_CONSTELLAB_DOCUMENT':
        return this.constellabDocCreated(event.entity);
      case 'UPLOAD_PROJECT_DOCUMENT':
        return this.documentCreated(event.entity, event.parentProject);
      case 'DELETE_PROJECT_DOCUMENT':
        return this.documentDeleted(event.entity, event.parentProject);
      case 'CREATE_PROJECT_COMMENT':
        return this.projectCommentCreated(event.entity, event.parentProject);
      case 'DELETE_PROJECT_COMMENT':
        return this.projectCommentDeleted(event.entity, event.parentProject);
      default:
        return null;
    }
  }


  private subProjectCreated(project: CnProject, parentProject: CnProject): CnActivityAndNotif {
    return {
      activity: {
        entityType: CnActivityEntityType.PROJECT,
        entity: project,
        actionType: CnActivityType.CREATE,
        title: `{{user.name}} has created sub project ${project.title} under project ${parentProject.title}`,
        entityName: project.title,
      }, notif: {link: CnFrontService.getProjectRoute(project.id)}
    };
  }

  private projectUpdated(project: CnProject): CnActivityAndNotif {
    return {
      activity: {
        entityType: CnActivityEntityType.PROJECT,
        entity: project,
        actionType: CnActivityType.UPDATE,
        title: `{{user.name}} has updated project ${project.title}`,
        entityName: project.title,
      }, notif: {link: CnFrontService.getProjectRoute(project.id)}
    };
  }

  private projectLeaderUpdated(project: CnProject): CnActivityAndNotif {
    return {
      activity: {
        entityType: CnActivityEntityType.PROJECT,
        entity: project,
        actionType: CnActivityType.UPDATE,
        title: `{{user.name}} has changed leader of project ${project.title} to ${project.leader.fullname}`,
        entityName: project.title,
      }, notif: {link: CnFrontService.getProjectRoute(project.id)}
    };
  }

  private projectStatusUpdated(project: CnProject): CnActivityAndNotif {
    return {
      activity: {
        entityType: CnActivityEntityType.PROJECT,
        entity: project,
        actionType: CnActivityType.UPDATE,
        title: `{{user.name}} has changed status of project ${project.title} to ${project.currentStatus.status}`,
        entityName: project.title,
      }, notif: {link: CnFrontService.getProjectRoute(project.id)}
    };
  }

  private projectShared(users: CnUser[], parentProject: CnProject): CnActivityAndNotif {
    const userText = users.length === 1 ? users[0].fullname : `${users.length} users`;
    return {
      activity: {
        entityType: CnActivityEntityType.PROJECT,
        entity: parentProject,
        actionType: CnActivityType.UPDATE,
        title: `{{user.name}} added ${userText} to project ${parentProject.title}`,
        entityName: parentProject.title,
      }, notif: {link: CnFrontService.getProjectRoute(parentProject.id)}
    };
  }

  private projectUnshared(user: CnUser, parentProject: CnProject): CnActivityAndNotif {
    return {
      activity: {
        entityType: CnActivityEntityType.PROJECT,
        entity: parentProject,
        actionType: CnActivityType.UPDATE,
        title: `{{user.name}} removed ${user.fullname} from project ${parentProject.title}`,
        entityName: parentProject.title,
      }, notif: {link: CnFrontService.getProjectRoute(parentProject.id)}
    };
  }

  private experimentCreated(experiment: CnExperiment, parentProject: CnProject): CnActivityAndNotif {
    return {
      activity: {
        entityType: CnActivityEntityType.EXPERIMENT,
        entity: experiment,
        actionType: CnActivityType.CREATE,
        title: `{{user.name}} has created experiment ${experiment.title} under project ${parentProject.title}`,
        entityName: experiment.title,
      }, notif: {link: CnFrontService.getExperimentRoute(experiment.id)}
    };
  }

  private experimentUpdated(experiment: CnExperiment, parentProject: CnProject): CnActivityAndNotif {
    return {
      activity: {
        entityType: CnActivityEntityType.EXPERIMENT,
        entity: experiment,
        actionType: CnActivityType.UPDATE,
        title: `{{user.name}} has updated experiment ${experiment.title} under project ${parentProject.title}`,
        entityName: experiment.title,
      }, notif: {link: CnFrontService.getExperimentRoute(experiment.id)}
    };
  }

  private experimentDeleted(experiment: CnExperiment, parentProject: CnProject): CnActivityAndNotif {
    return {
      activity: {
        entityType: CnActivityEntityType.EXPERIMENT,
        entity: experiment,
        actionType: CnActivityType.DELETE,
        title: `{{user.name}} has deleted experiment ${experiment.title} under project ${parentProject.title}`,
        entityName: experiment.title,
      }, notif: {link: CnFrontService.getProjectRoute(parentProject.id)}
    };
  }

  private reportCreated(report: CnReport, parentProject: CnProject): CnActivityAndNotif {
    return {
      activity: {
        entityType: CnActivityEntityType.REPORT,
        entity: report,
        actionType: CnActivityType.CREATE,
        title: `{{user.name}} has created report ${report.title} under project ${parentProject.title}`,
        entityName: report.title,
      }, notif: {link: CnFrontService.getReportRoute(report.id)}
    };
  }

  private reportUpdated(report: CnReport, parentProject: CnProject): CnActivityAndNotif {
    return {
      activity: {
        entityType: CnActivityEntityType.REPORT,
        entity: report,
        actionType: CnActivityType.UPDATE,
        title: `{{user.name}} has updated report ${report.title} under project ${parentProject.title}`,
        entityName: report.title,
      }, notif: {link: CnFrontService.getReportRoute(report.id)}
    };
  }

  private reportDeleted(report: CnReport, parentProject: CnProject): CnActivityAndNotif {
    return {
      activity: {
        entityType: CnActivityEntityType.REPORT,
        entity: report,
        actionType: CnActivityType.DELETE,
        title: `{{user.name}} has deleted report ${report.title} under project ${parentProject.title}`,
        entityName: report.title,
      }, notif: {link: CnFrontService.getProjectRoute(parentProject.id)}
    };
  }

  private constellabDocCreated(document: CnProjectDocument): CnActivityAndNotif {
    return {
      activity: {
        entityType: CnActivityEntityType.PROJECT_DOCUMENT,
        entity: document,
        actionType: CnActivityType.CREATE,
        title: `{{user.name}} has created constellab document ${document.name}`,
        entityName: document.name,
      }, notif: {link: CnFrontService.getConstellabDocRoute(document.id)}
    };
  }


  private documentCreated(document: CnProjectDocument, parentProject: CnProject): CnActivityAndNotif {
    return {
      activity: {
        entityType: CnActivityEntityType.PROJECT_DOCUMENT,
        entity: document,
        actionType: CnActivityType.CREATE,
        title: `{{user.name}} has uploaded document ${document.name}`,
        entityName: document.name,
      }, notif: {link: CnFrontService.getProjectRoute(parentProject.id)}
    };
  }

  private documentDeleted(document: CnProjectDocument, parentProject: CnProject): CnActivityAndNotif {
    return {
      activity: {
        entityType: CnActivityEntityType.PROJECT_DOCUMENT,
        entity: document,
        actionType: CnActivityType.DELETE,
        title: `{{user.name}} has deleted document ${document.name}`,
        entityName: document.name,
      }, notif: {link: CnFrontService.getProjectRoute(parentProject.id)}
    };
  }

  private projectCommentCreated(comment: CnProjectComment, parentProject: CnProject): CnActivityAndNotif {
    return {
      activity: {
        entityType: CnActivityEntityType.PROJECT_COMMENT,
        entity: comment,
        actionType: CnActivityType.CREATE,
        title: `{{user.name}} has commented on project ${parentProject.title}`,
        entityName: parentProject.title,
      }
    };
  }

  private projectCommentDeleted(comment: CnProjectComment, parentProject: CnProject): CnActivityAndNotif {
    return {
      activity: {
        entityType: CnActivityEntityType.PROJECT_COMMENT,
        entity: comment,
        actionType: CnActivityType.DELETE,
        title: `{{user.name}} has deleted comment on project ${parentProject.title}`,
        entityName: parentProject.title,
      }
    };
  }

  /**
   * Handle notification on comment to send notification to mentioned users
   * @param activity
   * @param comment
   * @param parentProject
   * @private
   */
  private async handleCommentCreated(activity: CnActivity, comment: CnProjectComment, parentProject: CnProject): Promise<void> {
    const projectUsers = await this.projectUserService.findByProjectId(parentProject.getRootParentId());

    const link = CnFrontService.getProjectCommentRoute(parentProject.id);

    const ancestors = await this.projectService.getAncestors(parentProject);
    const ancestorIds = ancestors.map(a => a.id);

    const userMentions = this.getUserMentions(comment.content, projectUsers);

    // send notification to mentioned users
    for (const userMention of userMentions) {

      await this.sendNotification(userMention,
        activity.user, activity.space.id, activity.entityType, activity.entityId,
        `${comment.createdBy.fullname} mentioned you in a comment on project ${parentProject.title}`,
        link, parentProject, ancestorIds);
    }

    // send notification to project users
    for (const projectUser of projectUsers) {
      // don't send notification to the user who created the comment and to the mentioned users
      if (projectUser.user.id === activity.user.id || userMentions.find(um => um.user.id == projectUser.user.id)) continue;

      await this.sendNotification(projectUser,
        activity.user, activity.space.id, activity.entityType, activity.entityId, activity.cleanTitle,
        link, parentProject, ancestorIds);
    }
  }

  private getUserMentions(content: BlRichTextI, projectUsers: CnProjectUser[]): CnProjectUser[] {
    const userMentions: CnProjectUser[] = [];
    const mentions: string[] = BlRichText.getMentions(content);
    if (mentions.length > 0) {
      for (const m of mentions) {
        // TODO what it is ? valentin
        // mention for everyone
        if (m == 'everyone') {
          for (const projectUser of projectUsers) {
            if (!userMentions.find(um => um.user.id == projectUser.user.id)
              && projectUser.user.id != CnCurrentUserHelper.getCurrentUser().id) // avoid duplicate
              userMentions.push(projectUser);
          }
        } else {
          const projectUser = projectUsers.find(pu => pu.user.id == m);
          if (!userMentions.find(um => um.user.id == projectUser.user.id)
            && projectUser.user.id != CnCurrentUserHelper.getCurrentUser().id) // avoid duplicate
            userMentions.push(projectUser);
        }
      }
    }
    return userMentions;
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

}
