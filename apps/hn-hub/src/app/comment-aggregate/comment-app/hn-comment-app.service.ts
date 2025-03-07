import { Injectable } from '@nestjs/common';
import { HnAbstractCommentService } from '../comment-core/hn-abstract-comment.service';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, EntityManager, Repository } from 'typeorm';
import { HnCommentApp } from './hn-comment-app.entity';
import { HnCommunityAppAggregateService } from '../../community-app-aggregate/hn-community-app-aggregate.service';
import { HnCommunityAppEntity } from '../../community-app-aggregate/community-app/hn-community-app.entity';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { TeRichText } from '@monorepo/te-text-editor';

@Injectable()
export class HnCommentAppService extends HnAbstractCommentService<HnCommunityAppEntity> {
  constructor(
    private communityAppAggregateService: HnCommunityAppAggregateService,
    @InjectRepository(HnCommentApp) commentAppRepository: Repository<HnCommentApp>,
    dataSource: DataSource,
    eventEmitter: EventEmitter2
  ) {
    super(commentAppRepository, dataSource, eventEmitter);
  }

  async getEntityAndCheckRightsById(entityId: string): Promise<HnCommunityAppEntity> {
    return this.communityAppAggregateService.findOneById(entityId);
  }

  getEntityClass(): typeof HnCommentApp {
    return HnCommentApp;
  }

  createComment(entity: HnCommunityAppEntity, commentData: TeRichText): HnCommentApp {
    const comment: HnCommentApp = new HnCommentApp();
    comment.entityId = entity.id;
    comment.entity = entity;
    comment.setContentRichText(commentData);
    return comment;
  }

  async saveComment(entityManager: EntityManager, comment: HnCommentApp): Promise<HnCommentApp> {
    return await entityManager.save(comment as HnCommentApp);
  }
}
