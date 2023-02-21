import {DeleteResult, EntityManager, Repository} from 'typeorm';
import {FindOneOptions} from 'typeorm/find-options/FindOneOptions';
import {BlEntityWithId} from '../models/bl-entity-with-id.entity';
import {BlPersistenceAction, BlPersistenceLogger} from './bl-persistence-logger';
import {blPropertyIsNotUpdatable} from '../decorators/bl-not-updatable.decorator';
import {BlAbstractPaginatedService} from './bl-abstract-paginated.service';
import {FindOptionsRelations} from 'typeorm/find-options/FindOptionsRelations';
import {BlBadRequestException} from '../exceptions/bl-bad-request.exception';
import {BlNotFoundException} from '../exceptions/bl-not-found.exception';

export abstract class BlAbstractService<T extends BlEntityWithId>
  extends BlAbstractPaginatedService<T> {

  private readonly persistenceLogger = BlPersistenceLogger.getInstance();


  protected constructor(repo: Repository<T>,
                        entityClass: new() => T) {
    super(repo, entityClass);
  }

  async create(entity: T, entityManager?: EntityManager): Promise<T> {
    // remove the null id to prevent inserting error
    if (entity.id === null) {
      delete entity.id;
    }

    const newEntity: T = await this.getEntityManager(entityManager).save(entity);

    // if there is no transaction, the log is written after the next commit
    this.logAction('INSERT', newEntity.id, entityManager == null);
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

    // log before update, otherwise the commit is done before the log
    const newEntity2 = await this.getEntityManager(entityManager).save(newEntity);
    this.logAction('UPDATE', newEntity2.id, entityManager == null);
    return newEntity2;
  }


  async deleteById(id: string, entityManager?: EntityManager): Promise<DeleteResult> {
    const deleteResult: DeleteResult = await this.getEntityManager(entityManager).delete(this.entityClass, id);

    if (deleteResult.affected > 0) {
      this.logAction('DELETE', id, entityManager == null);
    }
    return deleteResult;
  }

  findById(id: string, relations?: FindOptionsRelations<T>,
           entityManager?: EntityManager): Promise<T | null> {
    if (id == null) {
      throw new BlBadRequestException('Id not provided');
    }

    // const options: FindOneOptions<T> = {where
    return this.getEntityManager(entityManager).findOne(this.entityClass,
      {where: {id: id}, relations: relations} as FindOneOptions<T>);
  }

  async findByIdAndCheck(id: string,
                         relations?: FindOptionsRelations<T>,
                         entityManager?: EntityManager): Promise<T> {
    const entity: T = await this.findById(id, relations, entityManager);
    if (entity == null) {
      throw new BlNotFoundException(`Object '${this.entityClass.name}' with id ${id} not found`);
    }
    return entity;
  }

  /**
   *  use to log persistence
   * @param actionName
   * @param entityId
   * @param directLog set it to true to directly log when there are on transaction
   * @private
   */
  private logAction(actionName: BlPersistenceAction, entityId: string, directLog: boolean): void {
    this.persistenceLogger.logPersistence(actionName, entityId, this.entityClass.name, directLog);
  }
}
