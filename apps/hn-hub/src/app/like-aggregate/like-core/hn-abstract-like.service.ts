import {BlEntityWithId} from '@monorepo/back-core-lib';
import {HnAbstractLikeEntity} from './hn-abstract-like.entity';
import {DataSource, EntityManager, Repository} from 'typeorm';
import {HnCurrentUserHelper} from '../../core/utils/hn-current-user.helper';

export abstract class HnAbstractLikeService<T extends BlEntityWithId> {

  repository: Repository<HnAbstractLikeEntity<BlEntityWithId>>;
  dataSource: DataSource;

  protected constructor(_repository: Repository<HnAbstractLikeEntity<BlEntityWithId>>,
                        _dataSource: DataSource) {
    this.repository = _repository;
    this.dataSource = _dataSource;
  }

  abstract getEntityById(entityId: string): Promise<T>;

  abstract addLike(entityManager: EntityManager,
                   entity: T): Promise<T>;

  abstract removeLike(entityManager: EntityManager,
                      entity: T): Promise<T>;

  abstract saveLike(entityManager: EntityManager,
                    like: HnAbstractLikeEntity<T>): Promise<HnAbstractLikeEntity<T>>;

  abstract createLike(entity: T): HnAbstractLikeEntity<T>;

  async getLike(entityId: string): Promise<HnAbstractLikeEntity<BlEntityWithId>> {
    return await this.repository.findOne({
      where: {
        entity: {
          id: entityId
        },
        likedBy: {
          id: HnCurrentUserHelper.getCurrentUser().id
        }
      }
    });
  }

  async checkIfLiked(entityId: string): Promise<boolean> {
    const like = await this.getLike(entityId);
    return like != null;
  }

  async like(entityId: string): Promise<T> {
    if (await this.checkIfLiked(entityId)) {
      throw new Error('Entity already liked')
    }

    const entity: T = await this.getEntityById(entityId);

    if (!entity) {
      throw new Error('Entity not found');
    }

    const like: any = this.createLike(entity);

    return await this.dataSource.transaction(async entityManager => {
      const newLike = await this.saveLike(entityManager, like);

      if (!newLike) {
        return null;
      }
      return await this.addLike(entityManager, (newLike as HnAbstractLikeEntity<any>).entity);
    });
  }

  async unlike(entityId: string): Promise<T> {
    if (!await this.checkIfLiked(entityId)) {
      throw new Error('Entity not liked');
    }

    const like: HnAbstractLikeEntity<BlEntityWithId> = await this.getLike(entityId);

    return await this.dataSource.transaction(async entityManager => {
      const removedLike = await entityManager.remove(like);
      if (!removedLike) {
        return null;
      }
      return await this.removeLike(entityManager, removedLike.entity as T);
    });
  }
}
