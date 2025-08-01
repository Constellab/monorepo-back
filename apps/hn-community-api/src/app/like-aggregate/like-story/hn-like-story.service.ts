import { Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { HnStory } from '../../story/hn-story.entity';
import { HnStoryService } from '../../story/hn-story.service';
import { HnAbstractLikeService } from '../like-core/hn-abstract-like.service';
import { HnLikeStory } from './hn-like-story.entity';

@Injectable()
export class HnLikeStoryService extends HnAbstractLikeService<HnStory> {
  constructor(
    private storyService: HnStoryService,
    @InjectRepository(HnLikeStory) likeStoryRepository: Repository<HnLikeStory>,
    eventEmitter: EventEmitter2
  ) {
    super(likeStoryRepository, eventEmitter);
  }

  async getEntityAndCheckRightsById(entityId: string): Promise<HnStory> {
    return this.storyService.findById(entityId);
  }

  createLike(entity: HnStory): HnLikeStory {
    const like: HnLikeStory = new HnLikeStory();
    like.entity = entity;
    return like;
  }
}
