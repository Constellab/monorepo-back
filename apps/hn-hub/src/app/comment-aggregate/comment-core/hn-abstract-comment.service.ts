import { HnAbstractCommentEntity } from './hn-abstract-comment.entity';
import { DataSource, EntityManager, Repository } from 'typeorm';
import { BlEntityWithId } from '@monorepo/back-core-lib';
import { HnCurrentUserHelper } from '../../core/utils/hn-current-user.helper';
import { ClPage } from '@monorepo/core-lib';
import { TeRichText } from '@monorepo/te-text-editor';

export abstract class HnAbstractCommentService<T extends BlEntityWithId> {
  repository: Repository<HnAbstractCommentEntity<BlEntityWithId>>;
  dataSource: DataSource;

  protected constructor(
    _repository: Repository<HnAbstractCommentEntity<BlEntityWithId>>,
    _dataSource: DataSource
  ) {
    this.repository = _repository;
    this.dataSource = _dataSource;
  }

  abstract getEntityById(entityId: string): Promise<T>;

  abstract addComment(entityManager: EntityManager, entity: T): Promise<T>;

  abstract removeComment(entityManager: EntityManager, entity: T): Promise<T>;

  abstract saveComment(
    entityManager: EntityManager,
    comment: HnAbstractCommentEntity<T>
  ): Promise<HnAbstractCommentEntity<T>>;

  abstract createComment(entity: T, commentData: TeRichText): HnAbstractCommentEntity<T>;

  abstract getComments(
    page: number,
    size: number,
    entityId: string
  ): Promise<ClPage<HnAbstractCommentEntity<T>>>;

  async getComment(entityId: string): Promise<HnAbstractCommentEntity<BlEntityWithId>> {
    return await this.repository.findOne({
      where: {
        entity: {
          id: entityId,
        },
        createdBy: {
          id: HnCurrentUserHelper.getCurrentUser().id,
        },
      },
    });
  }

  async comment(entityId: string, commentData: TeRichText): Promise<HnAbstractCommentEntity<T>> {
    const entity: T = await this.getEntityById(entityId);

    if (!entity) {
      throw new Error('Entity not found');
    }

    const comment: any = this.createComment(entity, commentData);
    return await this.dataSource.transaction(async (entityManager) => {
      const newComment = await this.saveComment(entityManager, comment);
      if (!newComment) {
        throw new Error('Error while creating the comment');
      }
      await this.addComment(entityManager, entity);
      return newComment;
    });
  }

  async deleteComment(commentId: string): Promise<void> {
    const comment = await this.repository.findOneBy({ id: commentId });
    await this.dataSource.transaction(async (entityManager) => {
      await entityManager.remove(comment);
      await this.removeComment(entityManager, comment.entity as T);
    });
  }
}
