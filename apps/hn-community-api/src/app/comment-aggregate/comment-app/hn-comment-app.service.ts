import { TeRichText } from '@monorepo/te-text-editor';
import { Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { HnCommunityApp } from '../../community-app-aggregate/community-app/hn-community-app.entity';
import { HnCommunityAppAggregateService } from '../../community-app-aggregate/hn-community-app-aggregate.service';
import { HnAbstractCommentService } from '../comment-core/hn-abstract-comment.service';
import { HnCommentApp } from './hn-comment-app.entity';

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
