import {Injectable, UnauthorizedException} from '@nestjs/common';
import {InjectRepository} from '@nestjs/typeorm';
import {CnProjectComment} from './cn-project-comment.entity';
import {DataSource, Repository} from 'typeorm';
import {CnCommentService} from '../cn-core/services/cn-comment.service';
import {CnProject} from '../cn-projects-aggregate/cn-projects/cn-project.entity';
import {CnNewComment} from '../cn-core/model/entities/cn-comment.entity';
import {ClPage} from '@monorepo/core-lib';
import {
  BlAbstractPaginatedService,
  BlBucketConfig,
  BlFile,
  BlObjectStorageService,
  BlRichText,
  BlRichTextI,
  BlRichTextUploadedImage
} from '@monorepo/back-core-lib';
import {CnNotificationService, CnNotificationType} from '../cn-notification/cn-notification.service';
import {CnNotificationCreateDTO} from '../cn-notification/cn-notification.entity';
import {CnCurrentUserHelper} from '../cn-core/utils/cn-current-user.helper';
import {CnFrontService} from '../cn-core/services/cn-front.service';
import {CnUser} from '../cn-users/cn-user.entity';
import {CnProjectBucketService} from '../cn-projects-aggregate/cn-project-bucket/cn-project-bucket.service';

@Injectable()
export class CnProjectCommentService extends CnCommentService<CnProjectComment> {

  constructor(@InjectRepository(CnProjectComment) private repository: Repository<CnProjectComment>,
              private notificationService: CnNotificationService,
              objectStorageService: BlObjectStorageService,
              private dataSource: DataSource) {
    super(objectStorageService, repository, CnProjectComment);
  }

  async saveProjectCommentImage(file: BlFile, bucketConfig: BlBucketConfig, projectId: string): Promise<BlRichTextUploadedImage> {
    const prefix = CnProjectBucketService.getPrefix('COMMENTS', projectId);
    return this.saveImage(file, bucketConfig, prefix);
  }

  async createComment(newComment: CnNewComment, project: CnProject, projectUsers: CnUser[]): Promise<CnProjectComment> {
    const projectComment: CnProjectComment = CnProjectComment.create(newComment, project);
    if (projectComment.isResponse) {
      projectComment.parentComment = await this.repository.findOneBy({id: newComment.parentCommentId});
    }
    const comment: CnProjectComment = await this.create(projectComment);

    const userMentions = await this.getUserMentions(newComment.content, projectUsers)
    for (const userMention of userMentions) {
      const newNotification: CnNotificationCreateDTO = {
        createdBy: comment.createdBy,
        user: userMention,
        link: CnFrontService.getProjectCommentRoute(project.id),
        text: 'project_comment_mention_notification_text',
        text2: comment.project.title,
        objectId: comment.id,
        objectType: CnNotificationType.PROJECT_COMMENT,
        spaceId: project.spaceId
      };
      await this.notificationService.createNotification(newNotification);
    }

    if (comment && comment.createdBy.id != project.leader.id) {
      const newNotification: CnNotificationCreateDTO = {
        createdBy: comment.createdBy,
        user: comment.project.leader,
        link: CnFrontService.getProjectCommentRoute(project.id),
        text: 'project_comment_notification_text',
        text2: comment.project.title,
        objectId: comment.id,
        objectType: CnNotificationType.PROJECT_COMMENT,
        spaceId: project.spaceId
      };
      await this.notificationService.createNotification(newNotification);
    }
    return comment;
  }

  async getProjectComments(projectId: string, page: number, size: number): Promise<ClPage<CnProjectComment>> {
    return BlAbstractPaginatedService.findPaginatedStatic(page, size, {
      where: {
        project: {
          id: projectId
        },
        isResponse: false
      },
      order: {
        createdAt: 'DESC' as any
      }
    }, this.repository.manager, CnProjectComment);
  }

  async delete(commentId: string, projectId: string): Promise<void> {
    await this.dataSource.transaction(async () => {
      const comment: CnProjectComment = await this.repository.findOneBy({
        id: commentId, project: {
          id: projectId
        }
      });

      if (comment.createdBy.id != CnCurrentUserHelper.getCurrentUser().id) {
        throw new UnauthorizedException();
      }
      await this.deleteById(comment.id);
    });
  }

  async updateComment(projectId: string, commentId: string, content: BlRichTextI): Promise<CnProjectComment> {
    return await this.dataSource.transaction(async () => {
      const comment: CnProjectComment = await this.repository.findOneBy({
        id: commentId,
        project: {
          id: projectId
        }
      });

      if (comment.createdBy.id != CnCurrentUserHelper.getCurrentUser().id) {
        throw new UnauthorizedException();
      }
      comment.content = BlRichText.getOptimisedContent(content);
      return await this.repository.save(comment);
    });
  }

  private async getUserMentions(content: BlRichTextI, projectUsers: CnUser[]): Promise<CnUser[]> {
    const userMentions: CnUser[] = [];
    const mentions: string[] = BlRichText.getMentions(content);
    if (mentions.length > 0) {
      for (const m of mentions) {
        // TODO what it is ? valentin
        if (m == '0') {
          for (const u of projectUsers) {
            if (!userMentions.find(um => um.id == u.id) && u.id != CnCurrentUserHelper.getCurrentUser().id) // avoid duplicate
              userMentions.push(u);
          }
        } else {
          const user = projectUsers.find(u => u.id == m);
          if (!userMentions.find(um => um.id == user.id) && user.id != CnCurrentUserHelper.getCurrentUser().id) // avoid duplicate
            userMentions.push(user);
        }
      }
    }
    return userMentions;
  }
}
