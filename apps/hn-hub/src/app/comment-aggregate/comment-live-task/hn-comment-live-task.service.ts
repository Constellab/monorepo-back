import {Injectable} from '@nestjs/common';
import {HnAbstractCommentService} from '../comment-core/hn-abstract-comment.service';
import {InjectRepository} from '@nestjs/typeorm';
import {DataSource, EntityManager, Repository} from 'typeorm';
import {HnCommentLiveTask} from './hn-comment-live-task.entity';
import {HnLiveTaskAggregateService} from '../../live-task-aggregate/hn-live-task-aggregate.service';
import {HnLiveTask} from '../../live-task-aggregate/live-task/hn-live-task.entity';
import {HnAbstractCommentEntity} from '../comment-core/hn-abstract-comment.entity';
import {ClPage} from '@monorepo/core-lib';
import {BlAbstractPaginatedService, BlRichTextContent} from '@monorepo/back-core-lib';
import {HnCommentLiveTaskDto} from './hn-comment-live-task.dto';

@Injectable()
export class HnCommentLiveTaskService extends HnAbstractCommentService<HnLiveTask> {
  constructor(
    private liveTaskAggregateService: HnLiveTaskAggregateService,
    @InjectRepository(HnCommentLiveTask) commentLiveTaskRepository: Repository<HnCommentLiveTask>,
    dataSource: DataSource
  ) {
    super(commentLiveTaskRepository, dataSource);
  }

  async addComment(entityManager: EntityManager, entity: HnLiveTask): Promise<HnLiveTask> {
    return this.liveTaskAggregateService.addComment(entity, entityManager);
  }

  createComment(entity: HnLiveTask, commentData: BlRichTextContent): HnAbstractCommentEntity<HnLiveTask> {
    const comment: HnCommentLiveTask = new HnCommentLiveTask();
    comment.entity = entity;
    comment.content = commentData;
    return comment;
  }

  async getEntityById(entityId: string): Promise<HnLiveTask> {
    return this.liveTaskAggregateService.findLiveTaskById(entityId);
  }

  async removeComment(entityManager: EntityManager, entity: HnLiveTask): Promise<HnLiveTask> {
    return this.liveTaskAggregateService.removeComment(entity, entityManager);
  }

  async saveComment(entityManager: EntityManager,
                    comment: HnCommentLiveTask): Promise<HnCommentLiveTask> {
    return entityManager.save(comment);
  }

  async getComments(page: number, size: number, entityId: string): Promise<ClPage<HnCommentLiveTaskDto>> {
    return (await BlAbstractPaginatedService.findPaginatedStatic(page, size, {
      where: {
        entity: {
          id: entityId
        }
      },
      order: {
        createdAt: 'DESC' as any
      }
    }, this.repository.manager, HnCommentLiveTask)).map(commentLiveTask => new HnCommentLiveTaskDto(commentLiveTask));
  }

}
