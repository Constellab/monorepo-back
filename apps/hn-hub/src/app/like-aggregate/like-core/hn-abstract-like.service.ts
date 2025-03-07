import { BlEntityWithId } from '@monorepo/back-core-lib';
import { HnAbstractLikeEntity } from './hn-abstract-like.entity';
import { DataSource, Repository } from 'typeorm';
import { HnCurrentUserHelper } from '../../core/utils/hn-current-user.helper';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { HnEntityType } from '../../core/model/entities/hn-entity-type.enum';
import { HnEventType, HnLikeEventData } from '../../core/utils/hn-events.enum';

export abstract class HnAbstractLikeService<T extends BlEntityWithId> {
  repository: Repository<HnAbstractLikeEntity<BlEntityWithId>>;
  dataSource: DataSource;
  eventEmitter: EventEmitter2;

  protected constructor(
    _repository: Repository<HnAbstractLikeEntity<BlEntityWithId>>,
    _dataSource: DataSource,
    _eventEmitter: EventEmitter2
  ) {
    this.repository = _repository;
    this.dataSource = _dataSource;
    this.eventEmitter = _eventEmitter;
  }

  abstract getEntityAndCheckRightsById(entityId: string): Promise<T>;

  abstract createLike(entity: T): HnAbstractLikeEntity<T>;

  async getLike(entityId: string): Promise<HnAbstractLikeEntity<BlEntityWithId>> {
    return await this.repository.findOne({
      where: {
        entity: {
          id: entityId,
        },
        likedBy: {
          id: HnCurrentUserHelper.getCurrentUser().id,
        },
      },
    });
  }

  async checkIfLiked(entityId: string): Promise<boolean> {
    const like = await this.getLike(entityId);
    return like != null;
  }

  async like(entityType: HnEntityType, entityId: string): Promise<number> {
    if (await this.checkIfLiked(entityId)) {
      throw new Error('Entity already liked');
    }

    const entity: T = await this.getEntityAndCheckRightsById(entityId);

    if (!entity) {
      throw new Error('Entity not found');
    }

    const like: any = this.createLike(entity);
    const numberOfLikes = (await this.getNumberOfLikes(entityId)) + 1;

    return await this.dataSource.transaction(async (entityManager) => {
      const newLike: HnAbstractLikeEntity<T> = await entityManager.save(like);

      if (!newLike) {
        return null;
      }

      await this.emitLikeEvent(entityType, newLike.entity.id, numberOfLikes + 1);

      return numberOfLikes;
    });
  }

  async unlike(entityType: HnEntityType, entityId: string): Promise<number> {
    if (!(await this.checkIfLiked(entityId))) {
      throw new Error('Entity not liked');
    }

    const like: HnAbstractLikeEntity<BlEntityWithId> = await this.getLike(entityId);
    const numberOfLikes = (await this.getNumberOfLikes(entityId)) - 1;

    return await this.dataSource.transaction(async (entityManager) => {
      const removedLike = await entityManager.remove(like);
      if (!removedLike) {
        return null;
      }

      await this.emitLikeEvent(entityType, removedLike.entity.id, numberOfLikes);

      return numberOfLikes;
    });
  }

  public async getNumberOfLikes(entityId: string): Promise<number> {
    return await this.repository.countBy({ entity: { id: entityId } });
  }

  private async emitLikeEvent(
    entityType: HnEntityType,
    entityId: string,
    numberOfLikes: number
  ): Promise<void> {
    this.eventEmitter.emit(this.getEvent(entityType), {
      entityId: entityId,
      numberOfLikes: numberOfLikes,
    } as HnLikeEventData);
  }

  private getEvent(entityType: HnEntityType): HnEventType {
    switch (entityType) {
      case HnEntityType.APP:
        return HnEventType.APP_LIKE;
      case HnEntityType.AGENT:
        return HnEventType.AGENT_LIKE;
      case HnEntityType.BRICK:
        return HnEventType.BRICK_LIKE;
      case HnEntityType.STORY:
        return HnEventType.STORY_LIKE;
      default:
        throw new Error('Unknown like type');
    }
  }
}
