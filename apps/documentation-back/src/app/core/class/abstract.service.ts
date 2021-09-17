import {DeleteResult, EntityManager, Repository} from 'typeorm';
import {EntityWithId} from '../model/entities/entity-with-id.entity';
import {BadRequestException, NotFoundException} from '@nestjs/common';
import {propertyIsNotUpdatable} from '../decorators/not-updatable.decorator';
import {FindOneOptions} from 'typeorm/find-options/FindOneOptions';
import {PersistenceAction, PersistenceLogger} from '../services/persistence-logger/persistence-logger';
import {FindManyOptions} from 'typeorm/find-options/FindManyOptions';
import {Page} from '../model/config/page.class';
import {ErrorText} from '../model/config/error-text.class';

export abstract class AbstractService<T extends EntityWithId> {

  private readonly maxPageSize: number = 50;

  private readonly persistenceLogger = PersistenceLogger.getInstance();


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
   * Use to check property metadata including {@link NotUpdatable}
   * @protected
   */
  protected async updateWithCompare(newEntity: T, dbEntity: T, entityManager?: EntityManager): Promise<T> {
    for (const property in dbEntity) {
      // eslint-disable-next-line no-prototype-builtins
      if (!dbEntity.hasOwnProperty(property)) {
        continue;
      }

      // check if the property is updatable or is undefined
      if (propertyIsNotUpdatable(newEntity, property) || newEntity[property] === undefined) {
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
      throw new BadRequestException(ErrorText.ID_NOT_PROVIDED);
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
                      entityManager?: EntityManager): Promise<Page<T>> {
    const manager: EntityManager = this.getEntityManager(entityManager);

    // must be a positive number
    const safePage: number = page < 0 ? 0 : page;
    // must be a positive number and be lower than maxPageSize
    const safeSize: number = size < 0 ? 10 : (size > this.maxPageSize ? this.maxPageSize : size);

    // build the options with the paginated filters
    const pageOptions: FindManyOptions<T> = {...options, skip: safePage * safeSize, take: safeSize};

    // count the total number of result
    const totalElements: number = await manager.count(this.entityClass, options);

    // get the results limited by page
    const result: T[] = await manager.find(this.entityClass, pageOptions);

    return new Page<T>(result, safePage === 0,
      ((safePage + 1) * safeSize) >= totalElements,
      totalElements, safePage, safeSize);
  }

  // use to log persistence
  private logAction(actionName: PersistenceAction, entityId: string): void {
    this.persistenceLogger.logPersistence(actionName, entityId, this.entityClass.name);
  }


  private getEntityManager(entityManager?: EntityManager): EntityManager {
    return entityManager ?? this.repo.manager;
  }
}
