import { Injectable } from '@nestjs/common';
import { HnAbstractLikeService } from '../like-core/hn-abstract-like.service';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, EntityManager, Repository } from 'typeorm';
import { HnLikeApp } from './hn-like-app.entity';
import { BlEntityWithId } from '@monorepo/back-core-lib';
import { HnCommunityApp } from '../../community-app-aggregate/hn-community-app/hn-community-app.entity';
import { HnCommunityAppAggregateService } from '../../community-app-aggregate/hn-community-app-aggregate.service';
import { HnCommunityAppDto } from '../../community-app-aggregate/hn-community-app/hn-community-app.dto';

@Injectable()
export class HnLikeAppService extends HnAbstractLikeService<HnCommunityApp> {
  constructor(
    private communityAppAggregateService: HnCommunityAppAggregateService,
    @InjectRepository(HnLikeApp) likeAgentRepository: Repository<HnLikeApp>,
    dataSource: DataSource
  ) {
    super(likeAgentRepository, dataSource);
  }

  async addLike(entityManager: EntityManager, entity: BlEntityWithId): Promise<HnCommunityAppDto> {
    return new HnCommunityAppDto(
      await this.communityAppAggregateService.addLike(entity as HnCommunityApp, entityManager)
    );
  }

  getEntityById(entityId: string): Promise<HnCommunityApp> {
    return this.communityAppAggregateService.findOneById(entityId);
  }

  async removeLike(entityManager: EntityManager, entity: BlEntityWithId): Promise<HnCommunityAppDto> {
    return new HnCommunityAppDto(
      await this.communityAppAggregateService.removeLike(entity as HnCommunityApp, entityManager)
    );
  }

  async saveLike(entityManager: EntityManager, like: HnLikeApp): Promise<HnLikeApp> {
    return entityManager.save(like);
  }

  createLike(entity: HnCommunityApp): HnLikeApp {
    const like: HnLikeApp = new HnLikeApp();
    like.entity = entity;
    return like;
  }
}
