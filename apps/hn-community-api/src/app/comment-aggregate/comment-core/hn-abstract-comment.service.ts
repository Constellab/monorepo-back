import {
  BlAbstractPaginatedService,
  BlBadRequestException,
  BlEntityWithId,
  BlNotFoundException,
  BlUnauthorizedException,
} from '@monorepo/back-core-lib';
import { ClPage } from '@monorepo/core-lib';
import { TeRichText } from '@monorepo/te-text-editor';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Repository } from 'typeorm';

import { HnEntityType } from '../../core/model/entities/hn-entity-type.enum';
import { HnCurrentUserHelper } from '../../core/utils/hn-current-user.helper';
import { HnCommentEventData, HnEventType } from '../../core/utils/hn-events.enum';
import { HnCommentEntity } from './hn-comment.entity';

export abstract class HnAbstractCommentService<T extends BlEntityWithId> {
  repository: Repository<HnCommentEntity<BlEntityWithId>>;
  eventEmitter: EventEmitter2;

  protected constructor(_repository: Repository<HnCommentEntity<T>>, _eventEmitter: EventEmitter2) {
    this.repository = _repository;
    this.eventEmitter = _eventEmitter;
  }

  abstract getEntityByIdAndCheck(entityId: string): Promise<T>;

  abstract getEntityClass(): typeof HnCommentEntity<T>;

  abstract createComment(entity: T, commentData: TeRichText): HnCommentEntity<T>;

  async getCommentsCount(entityId: string): Promise<number> {
    return await this.repository.countBy({ entity: { id: entityId } });
  }

  async getComments(page: number, size: number, entityId: string): Promise<ClPage<HnCommentEntity<T>>> {
    return await BlAbstractPaginatedService.findPaginatedStatic(
      page,
      size,
      {
        where: {
          entity: {
            id: entityId,
          } as any,
        },
        order: {
          createdAt: 'DESC' as any,
        },
      },
      this.repository.manager,
      this.getEntityClass()
    );
  }

  async comment(
    commentType: HnEntityType,
    entityId: string,
    commentData: TeRichText
  ): Promise<HnCommentEntity<T>> {
    const entity: T = await this.getEntityByIdAndCheck(entityId);
    if (!entity) {
      throw new BlNotFoundException('Entity not found');
    }
    const comment: HnCommentEntity<T> = this.createComment(entity, commentData);
    const newComment = await this.repository.save(comment);
    this.emitCommentEvent(
      commentType,
      newComment.entityId,
      await this.getNumberOfComments(newComment.entityId)
    );
    return newComment;
  }

  async deleteComment(commentType: HnEntityType, commentId: string): Promise<void> {
    const comment = await this.repository.findOneBy({ id: commentId });
    if (!comment) {
      throw new BlNotFoundException('Comment not found');
    }

    const currentUser = HnCurrentUserHelper.getAndCheckCurrentUser();
    if (comment.createdBy?.id !== currentUser.id && !currentUser.isAdmin()) {
      throw new BlUnauthorizedException('You can only delete your own comments');
    }

    await this.repository.remove(comment);
    this.emitCommentEvent(commentType, comment.entityId, await this.getNumberOfComments(comment.entityId));
  }

  private emitCommentEvent(commentType: HnEntityType, entityId: string, numberOfComments: number): void {
    this.eventEmitter.emit(this.getEvent(commentType), {
      entityId: entityId,
      numberOfComments: numberOfComments,
    });
  }

  private async getNumberOfComments(entityId: string): Promise<number> {
    return await this.repository.countBy({ entity: { id: entityId } });
  }

  private getEvent(commentType: HnEntityType): HnEventType {
    switch (commentType) {
      case HnEntityType.APP:
        return HnEventType.APP_COMMENT;
      case HnEntityType.AGENT:
        return HnEventType.AGENT_COMMENT;
      case HnEntityType.STORY:
        return HnEventType.STORY_COMMENT;
      case HnEntityType.TAG:
        return HnEventType.TAG_COMMENT;
      case HnEntityType.PARTNER:
        return HnEventType.PARTNER_COMMENT;
      default:
        throw new BlBadRequestException('Unknown comment type');
    }
  }
}
