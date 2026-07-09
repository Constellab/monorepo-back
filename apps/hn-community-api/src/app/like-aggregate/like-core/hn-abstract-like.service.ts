import { BlBadRequestException, BlEntityWithId, BlNotFoundException } from '@monorepo/back-core-lib';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Repository } from 'typeorm';

import { HnEntityType } from '../../core/model/entities/hn-entity-type.enum';
import { HnCurrentUserHelper } from '../../core/utils/hn-current-user.helper';
import { HnEventType } from '../../core/utils/hn-events.enum';
import { HnAbstractLikeEntity } from './hn-abstract-like.entity';

export abstract class HnAbstractLikeService<T extends BlEntityWithId> {
  repository: Repository<HnAbstractLikeEntity<BlEntityWithId>>;
  eventEmitter: EventEmitter2;

  protected constructor(
    _repository: Repository<HnAbstractLikeEntity<BlEntityWithId>>,
    _eventEmitter: EventEmitter2
  ) {
    this.repository = _repository;
    this.eventEmitter = _eventEmitter;
  }

  abstract getEntityAndCheckById(entityId: string): Promise<T>;

  abstract createLike(entity: T): HnAbstractLikeEntity<T>;

  async getLike(entityId: string): Promise<HnAbstractLikeEntity<BlEntityWithId> | null> {
    return await this.repository.findOne({
      where: {
        entity: {
          id: entityId,
        },
        likedBy: {
          id: HnCurrentUserHelper.getAndCheckCurrentUser().id,
        },
      },
    });
  }

  async checkIfLiked(entityId: string): Promise<boolean> {
    const like = await this.getLike(entityId);
    return like != null;
  }

  async like(entityType: HnEntityType, entityId: string): Promise<number> {
    const entity: T = await this.getEntityAndCheckById(entityId);
    if (!entity) {
      throw new BlNotFoundException('Entity not found');
    }

    const like: any = this.createLike(entity);
    try {
      await this.repository.save(like);
    } catch (e: any) {
      if (e?.code === 'ER_DUP_ENTRY') {
        throw new BlBadRequestException('Entity already liked');
      }
      throw e;
    }

    const numberOfLikes = await this.getNumberOfLikes(entityId);
    this.emitLikeEvent(entityType, entityId, numberOfLikes);
    return numberOfLikes;
  }

  async unlike(entityType: HnEntityType, entityId: string): Promise<number> {
    const like: HnAbstractLikeEntity<BlEntityWithId> | null = await this.getLike(entityId);
    if (!like) {
      throw new BlBadRequestException('Entity not liked');
    }

    await this.repository.remove(like);

    const numberOfLikes = await this.getNumberOfLikes(entityId);
    this.emitLikeEvent(entityType, entityId, numberOfLikes);
    return numberOfLikes;
  }

  public async getNumberOfLikes(entityId: string): Promise<number> {
    return await this.repository.countBy({ entity: { id: entityId } });
  }

  private emitLikeEvent(entityType: HnEntityType, entityId: string, numberOfLikes: number): void {
    this.eventEmitter.emit(this.getEvent(entityType), {
      entityId: entityId,
      numberOfLikes: numberOfLikes,
    });
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
      case HnEntityType.TAG:
        return HnEventType.TAG_LIKE;
      case HnEntityType.PARTNER:
        return HnEventType.PARTNER_LIKE;
      default:
        throw new BlBadRequestException('Unknown like type');
    }
  }
}
