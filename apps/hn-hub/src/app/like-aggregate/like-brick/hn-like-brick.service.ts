import { Injectable } from '@nestjs/common';
import { HnAbstractLikeService } from '../like-core/hn-abstract-like.service';
import { HnLikeBrick } from './hn-like-brick.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, EntityManager, Repository } from 'typeorm';
import { HnBrick } from '../../brick-aggregate/brick/hn-brick.entity';
import { HnBrickAggregateService } from '../../brick-aggregate/hn-brick-aggregate.service';
import { HnBrickDto } from '../../brick-aggregate/brick/hn-brick.dto';

@Injectable()
export class HnLikeBrickService extends HnAbstractLikeService<HnBrick> {
  constructor(
    private brickAggregateService: HnBrickAggregateService,
    @InjectRepository(HnLikeBrick) likeBrickRepository: Repository<HnLikeBrick>,
    dataSource: DataSource
  ) {
    super(likeBrickRepository, dataSource);
  }

  async getEntityById(entityId: string): Promise<HnBrick> {
    return this.brickAggregateService.findBrickById(entityId);
  }

  async addLike(entityManager: EntityManager, entity: HnBrick): Promise<HnBrickDto> {
    return new HnBrickDto(await this.brickAggregateService.addLike(entity, entityManager));
  }

  async removeLike(entityManager: EntityManager, entity: HnBrick): Promise<HnBrickDto> {
    return new HnBrickDto(await this.brickAggregateService.removeLike(entity, entityManager));
  }

  async saveLike(entityManager: EntityManager, like: HnLikeBrick): Promise<HnLikeBrick> {
    return entityManager.save(like);
  }

  createLike(entity: HnBrick): HnLikeBrick {
    const like: HnLikeBrick = new HnLikeBrick();
    like.entity = entity;
    return like;
  }
}
