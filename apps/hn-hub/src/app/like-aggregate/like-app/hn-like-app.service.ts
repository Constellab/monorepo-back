import { Injectable } from '@nestjs/common';
import { HnAbstractLikeService } from '../like-core/hn-abstract-like.service';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { HnLikeApp } from './hn-like-app.entity';
import { HnCommunityApp } from '../../community-app-aggregate/community-app/hn-community-app.entity';
import { HnCommunityAppAggregateService } from '../../community-app-aggregate/hn-community-app-aggregate.service';
import { EventEmitter2 } from '@nestjs/event-emitter';

@Injectable()
export class HnLikeAppService extends HnAbstractLikeService<HnCommunityApp> {
  constructor(
    private communityAppAggregateService: HnCommunityAppAggregateService,
    @InjectRepository(HnLikeApp) likeAppRepository: Repository<HnLikeApp>,
    eventEmitter: EventEmitter2
  ) {
    super(likeAppRepository, eventEmitter);
  }

  getEntityAndCheckRightsById(entityId: string): Promise<HnCommunityApp> {
    return this.communityAppAggregateService.findOneById(entityId);
  }

  createLike(entity: HnCommunityApp): HnLikeApp {
    const like: HnLikeApp = new HnLikeApp();
    like.entity = entity;
    return like;
  }
}
