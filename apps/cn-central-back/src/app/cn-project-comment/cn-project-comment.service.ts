import {Injectable, UnauthorizedException} from '@nestjs/common';
import {InjectRepository} from '@nestjs/typeorm';
import {CnProjectComment} from './cn-project-comment.entity';
import {DataSource, Repository} from 'typeorm';
import {CnCommentService} from '../cn-core/services/cn-comment.service';
import {CnProject} from '../cn-projects-aggregate/cn-projects/cn-project.entity';
import {CnCommentImage, CnNewComment} from '../cn-core/model/entities/cn-comment.entity';
import {ClPage} from '@monorepo/core-lib';
import {BlAbstractPaginatedService, BlBucketConfig, BlFile, BlObjectStorageService} from '@monorepo/back-core-lib';
import {CnNotificationService, CnNotificationType} from '../cn-notification/cn-notification.service';
import {CnNotificationCreateDTO} from '../cn-notification/cn-notification.entity';
import {CmRichText, CmRichTextI} from '@monorepo/common-model';
import {CnCurrentUserHelper} from '../cn-core/utils/cn-current-user.helper';
import {CnFrontService} from '../cn-core/services/cn-front.service';
import {CnUser} from '../cn-users/cn-user.entity';

@Injectable()
export class CnProjectCommentService extends CnCommentService<CnProjectComment> {

  private static readonly COMMENT_BUCKET_PREFIX = 'comments';

  constructor(@InjectRepository(CnProjectComment)
              private projectCommentRepository: Repository<CnProjectComment>,
              private notificationService: CnNotificationService,
              objectStorageService: BlObjectStorageService,
              dataSource: DataSource) {
    super(dataSource, objectStorageService);
  }

  async saveProjectCommentImage(files: BlFile[], bucketConfig: BlBucketConfig, projectId: string): Promise<CnCommentImage> {
    return this.saveImage(files, bucketConfig,
      CnProjectCommentService.COMMENT_BUCKET_PREFIX + '/' + projectId + '/');
  }

  async create(newComment: CnNewComment, project: CnProject, userMentions: CnUser[]): Promise<CnProjectComment> {

    const comment: CnProjectComment = await this.dataSource.transaction(async () => {
      const projectComment: CnProjectComment = CnProjectComment.create(newComment, project);
      if (projectComment.isResponse) {
        projectComment.parentComment = await this.projectCommentRepository.findOneBy({id: newComment.parentCommentId});
      }
      return await this.createComment(projectComment);
    });

    for(const uM of userMentions) {
      const newNotification: CnNotificationCreateDTO = {
        createdBy: comment.createdBy,
        user: uM,
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
    }, this.projectCommentRepository.manager, CnProjectComment);
  }

  async delete(commentId: string, projectId: string): Promise<void> {
    await this.dataSource.transaction(async () => {
      const comment: CnProjectComment = await this.projectCommentRepository.findOneBy({
        id: commentId, project: {
          id: projectId
        }
      });

      if (comment.createdBy.id != CnCurrentUserHelper.getCurrentUser().id) {
        throw new UnauthorizedException();
      }
      await this.deleteComment(comment);
    });
  }

  async updateComment(projectId: string, commentId: string, content: CmRichTextI): Promise<CnProjectComment> {
    return await this.dataSource.transaction(async () => {
      const comment: CnProjectComment = await this.projectCommentRepository.findOneBy({
        id: commentId,
        project: {
          id: projectId
        }
      });

      if (comment.createdBy.id != CnCurrentUserHelper.getCurrentUser().id) {
        throw new UnauthorizedException();
      }
      comment.content = CmRichText.getOptimisedContent(content);
      return await this.projectCommentRepository.save(comment);
    });
  }
}
