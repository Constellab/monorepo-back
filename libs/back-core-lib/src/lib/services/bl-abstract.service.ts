import {DeleteResult, EntityManager, Repository} from 'typeorm';
import {BadRequestException, NotFoundException} from '@nestjs/common';
import {FindOneOptions} from 'typeorm/find-options/FindOneOptions';
import {FindManyOptions} from 'typeorm/find-options/FindManyOptions';
import {ClPage, ClPageI} from '@monorepo/core-lib';
import {BlEntityWithId} from '../models/bl-entity-with-id.entity';
import {BlPersistenceAction, BlPersistenceLogger} from './bl-persistence-logger';
import {blPropertyIsNotUpdatable} from '../decorators/bl-not-updatable.decorator';

export abstract class BlAbstractService<T extends BlEntityWithId> {

  private readonly maxPageSize: number = 50;

  private readonly persistenceLogger = BlPersistenceLogger.getInstance();


  protected constructor(private repo: Repository<T>,
                        private entityClass: new() => T) {

  }

  async create(entity: T, entityManager?: EntityManager): Promise<T> {
    // remove the null id to prevent inserting error
    if (entity.id === null) {
      delete entity.id;
    }

    const newEntity: T = await this.getEntityManager(entityManager).save(entity);

    this.logAction('INSERT', newEntity.id);
    return newEntity;
  }

  /**
   * retrieve the entity in the db then call updateWithCompare
   */
  async update(entity: T, entityManager?: EntityManager): Promise<T> {
    return this.updateWithCompare(entity, await this.findByIdAndCheck(entity.id), entityManager);
  }

  /**
   * Compare the DB entity and update it
   * Use to check property metadata including {@link BlNotUpdatable}
   * @protected
   */
  protected async updateWithCompare(newEntity: T, dbEntity: T, entityManager?: EntityManager): Promise<T> {
    for (const property in dbEntity) {
      // eslint-disable-next-line no-prototype-builtins
      if (!dbEntity.hasOwnProperty(property)) {
        continue;
      }

      // check if the property is updatable or is undefined
      if (blPropertyIsNotUpdatable(newEntity, property) || newEntity[property] === undefined) {
        // if not set the value of the db (if undefined it won't be updated)
        newEntity[property] = dbEntity[property];
      }

    }

    const newEntity2: T = await this.getEntityManager(entityManager).save(newEntity);

    this.logAction('UPDATE', newEntity2.id);
    return newEntity2;
  }


  async deleteById(id: string, entityManager?: EntityManager): Promise<DeleteResult> {
    const deleteResult: DeleteResult = await this.getEntityManager(entityManager).delete(this.entityClass, id);

    if (deleteResult.affected > 0) {
      this.logAction('DELETE', id);
    }
    return deleteResult;
  }

  findById(id: string, options?: FindOneOptions<T>, entityManager?: EntityManager): Promise<T | null> {
    if (id == null) {
      throw new BadRequestException('Id not provided');
    }

    return this.getEntityManager(entityManager).findOne(this.entityClass, id, options);
  }

  async findByIdAndCheck(id: string, options?: FindOneOptions<T>, entityManager?: EntityManager): Promise<T> {
    const entity: T = await this.findById(id, options, entityManager);
    if (entity == null) {
      throw new NotFoundException();
    }
    return entity;
  }

  async findPaginated(page: number = 0, size: number = 10, options: FindOneOptions<T> = {},
                      entityManager?: EntityManager): Promise<ClPageI<T>> {
    const manager: EntityManager = this.getEntityManager(entityManager);

    const safePage: number = this.getSafePage(page);
    const safeSize: number = this.getSafePageSize(size);

    // build the options with the paginated filters
    const pageOptions: FindManyOptions<T> = {...options, skip: safePage * safeSize, take: safeSize};

    // get and count the total number of result
    const [result, totalElements] = await manager.findAndCount(this.entityClass, pageOptions);

    return ClPage.fromPagination(safePage, safeSize, totalElements, result);
  }

  // use to log persistence
  private logAction(actionName: BlPersistenceAction, entityId: string): void {
    this.persistenceLogger.logPersistence(actionName, entityId, this.entityClass.name);
  }

  protected getSafePage(page: number): number{
    // must be a positive number
    return Math.max(page, 0)
  }

  protected getSafePageSize(size: number): number{
    // must be a positive number and be lower than maxPageSize
    return size < 0 ? 10 : (size > this.maxPageSize ? this.maxPageSize : size)
  }

  protected getEntityManager(entityManager?: EntityManager): EntityManager {
    return entityManager ?? this.repo.manager;
  }
}
