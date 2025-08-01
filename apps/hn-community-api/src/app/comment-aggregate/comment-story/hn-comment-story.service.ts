import { TeRichText } from '@monorepo/te-text-editor';
import { Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { HnStory } from '../../story/hn-story.entity';
import { HnStoryService } from '../../story/hn-story.service';
import { HnAbstractCommentService } from '../comment-core/hn-abstract-comment.service';
import { HnCommentStory } from './hn-comment-story.entity';

@Injectable()
export class HnCommentStoryService extends HnAbstractCommentService<HnStory> {
  constructor(
    private storyService: HnStoryService,
    @InjectRepository(HnCommentStory) commentStoryRepository: Repository<HnCommentStory>,
    eventEmitter: EventEmitter2
  ) {
    super(commentStoryRepository, eventEmitter);
  }

  async getEntityAndCheckRightsById(entityId: string): Promise<HnStory> {
    return this.storyService.getStory(entityId);
  }

  getEntityClass(): typeof HnCommentStory {
    return HnCommentStory;
  }

  createComment(entity: HnStory, commentData: TeRichText): HnCommentStory {
    const comment: HnCommentStory = new HnCommentStory();
    comment.entityId = entity.id;
    comment.entity = entity;
    comment.setContentRichText(commentData);
    return comment;
  }
}
