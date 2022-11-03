import {Injectable} from '@nestjs/common';
import {InjectRepository} from '@nestjs/typeorm';
import {CnProjectComment} from './cn-project-comment.entity';
import {DataSource, Repository} from 'typeorm';
import {CnCommentService} from '../cn-core/services/cn-comment.service';
import {CnProject} from '../cn-projects-aggregate/cn-projects/cn-project.entity';
import {CnNewComment} from '../cn-core/model/entities/cn-comment.entity';
import {ClPage} from '@monorepo/core-lib';
import {BlAbstractPaginatedService} from '@monorepo/back-core-lib';
import {CnNotificationService, CnNotificationType} from '../cn-notification/cn-notification.service';
import {CnNotificationCreateDTO} from '../cn-notification/cn-notification.entity';

@Injectable()
export class CnProjectCommentService extends CnCommentService<CnProjectComment> {

  constructor(
    @InjectRepository(CnProjectComment)
    private projectCommentRepository: Repository<CnProjectComment>,
    private notificationService: CnNotificationService,
    dataSource: DataSource
  ) {
    super(dataSource);
  }

  async create(newComment: CnNewComment, project: CnProject): Promise<CnProjectComment> {
    let comment: CnProjectComment = null;

    comment = await this.dataSource.transaction(async () => {
      const projectComment: CnProjectComment = CnProjectComment.create(newComment, project);
      if (projectComment.isResponse) {
        projectComment.parentComment = await this.projectCommentRepository.findOneBy({id: newComment.parentCommentId});
      }
      return await this.createComment(projectComment);
    });

    if(comment && comment.createdBy.id != project.leader.id){
      const newNotification: CnNotificationCreateDTO = {
        createdBy: comment.createdBy,
        user: comment.project.leader,
        link: '/project/' + project.id + '?type=comments',
        text: comment.createdBy.firstname + ' a commenté votre projet',
        text2: comment.project.title,
        objectId: comment.id,
        objectType: CnNotificationType.PROJECT_COMMENT,
        organization: project.organization
      }
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
}
