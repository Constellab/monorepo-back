import { Injectable } from '@nestjs/common';
import { HnAbstractCommentService } from '../comment-core/hn-abstract-comment.service';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { HnCommentApp } from './hn-comment-app.entity';
import { HnCommunityAppAggregateService } from '../../community-app-aggregate/hn-community-app-aggregate.service';
import { HnCommunityApp } from '../../community-app-aggregate/community-app/hn-community-app.entity';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { TeRichText } from '@monorepo/te-text-editor';

@Injectable()
export class HnCommentAppService extends HnAbstractCommentService<HnCommunityApp> {
  constructor(
    private communityAppAggregateService: HnCommunityAppAggregateService,
    @InjectRepository(HnCommentApp) commentAppRepository: Repository<HnCommentApp>,
    eventEmitter: EventEmitter2
  ) {
    super(commentAppRepository, eventEmitter);
  }

  async getEntityAndCheckRightsById(entityId: string): Promise<HnCommunityApp> {
    return this.communityAppAggregateService.findOneById(entityId);
  }

  getEntityClass(): typeof HnCommentApp {
    return HnCommentApp;
  }

  createComment(entity: HnCommunityApp, commentData: TeRichText): HnCommentApp {
    const comment: HnCommentApp = new HnCommentApp();
    comment.entityId = entity.id;
    comment.entity = entity;
    comment.setContentRichText(commentData);
    return comment;
  }
}
