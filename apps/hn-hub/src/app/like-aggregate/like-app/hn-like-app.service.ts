import { Injectable } from '@nestjs/common';
import { HnAbstractLikeService } from '../like-core/hn-abstract-like.service';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { HnLikeApp } from './hn-like-app.entity';
import { HnCommunityAppEntity } from '../../community-app-aggregate/community-app/hn-community-app.entity';
import { HnCommunityAppAggregateService } from '../../community-app-aggregate/hn-community-app-aggregate.service';
import { EventEmitter2 } from '@nestjs/event-emitter';

@Injectable()
export class HnLikeAppService extends HnAbstractLikeService<HnCommunityAppEntity> {
  constructor(
    private communityAppAggregateService: HnCommunityAppAggregateService,
    @InjectRepository(HnLikeApp) likeAppRepository: Repository<HnLikeApp>,
    dataSource: DataSource,
    eventEmitter: EventEmitter2
  ) {
    super(likeAppRepository, dataSource, eventEmitter);
  }

  getEntityAndCheckRightsById(entityId: string): Promise<HnCommunityAppEntity> {
    return this.communityAppAggregateService.findOneById(entityId);
  }

  createLike(entity: HnCommunityAppEntity): HnLikeApp {
    const like: HnLikeApp = new HnLikeApp();
    like.entity = entity;
    return like;
  }
}
