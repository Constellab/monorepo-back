import {Injectable} from '@nestjs/common';
import {HnAbstractCommentService} from '../comment-core/hn-abstract-comment.service';
import {InjectRepository} from '@nestjs/typeorm';
import {DataSource, Repository} from 'typeorm';
import {ClPage} from '@monorepo/core-lib';
import {BlAbstractPaginatedService, BlNotFoundException, BlRichTextContent} from '@monorepo/back-core-lib';
import {HnCommentLiveTask} from './hn-comment-live-task.entity';
import {HnLiveTaskAggregateService} from '../../live-task-aggregate/hn-live-task-aggregate.service';

@Injectable()
export class HnCommentLiveTaskService extends HnAbstractCommentService {
  constructor(
    @InjectRepository(HnCommentLiveTask)
    private commentLiveTaskRepository: Repository<HnCommentLiveTask>,
    private liveTaskAggregateService: HnLiveTaskAggregateService,
    private dataSource: DataSource
  ) {
    super();
  }

  async createComment(content: BlRichTextContent, entityId: string): Promise<HnCommentLiveTask> {
    const liveTask = await this.liveTaskAggregateService.findLiveTaskById(entityId);
    if (!liveTask) {
      throw new BlNotFoundException('LiveTask not found');
    }

    if (!content) {
      throw new BlNotFoundException('Content is required');
    }


    return await this.dataSource.transaction(async entityManager => {
      const comment = new HnCommentLiveTask();
      comment.content = content;
      comment.liveTask = liveTask;

      const res = await this.commentLiveTaskRepository.save(comment);
      if (!res){
        throw new Error('Error while creating the comment');
      }
      await this.liveTaskAggregateService.addComment(res.liveTask, entityManager);
      return res;
    });
  }

  async deleteComment(commentId: string): Promise<void> {
    const comment = await this.commentLiveTaskRepository.findOneBy({id: commentId});
    await this.dataSource.transaction(async entityManager => {
      await entityManager.remove(comment);
      await this.liveTaskAggregateService.removeComment(comment.liveTask, entityManager);
    });
  }

  async getComments(page: number, size: number, entityId: string): Promise<ClPage<HnCommentLiveTask>> {
    return BlAbstractPaginatedService.findPaginatedStatic(page, size, {
      where: {
        liveTask: {
          id: entityId
        }
      },
      order: {
        createdAt: 'DESC' as any
      }
    }, this.commentLiveTaskRepository.manager, HnCommentLiveTask);
  }


}
