import { DeleteResult, EntityManager, Repository } from 'typeorm';
import { FindOneOptions } from 'typeorm/find-options/FindOneOptions';
import { BlEntityWithId } from '../models/bl-entity-with-id.entity';
import { blPropertyIsNotUpdatable } from '../decorators/bl-not-updatable.decorator';
import { BlAbstractPaginatedService } from './bl-abstract-paginated.service';
import { FindOptionsRelations } from 'typeorm/find-options/FindOptionsRelations';
import { BlBadRequestException } from '../exceptions/bl-bad-request.exception';
import { BlNotFoundException } from '../exceptions/bl-not-found.exception';

export abstract class BlAbstractService<T extends BlEntityWithId> extends BlAbstractPaginatedService<T> {
  protected constructor(repo: Repository<T>, entityClass: new () => T) {
    super(repo, entityClass);
  }

  /**
   * Override save method to log the action
   * @param entity
   * @param entityManager
   */
  async save(entity: T, entityManager?: EntityManager): Promise<T> {
    return await this.getEntityManager(entityManager).save(entity);
  }

  async create(entity: T, entityManager?: EntityManager): Promise<T> {
    // remove the null id to prevent inserting error
    if (entity.id === null) {
      delete entity.id;
    }

    return await this.getEntityManager(entityManager).save(entity);
  }

  /**
   * retrieve the entity in the db then call updateWithCompare
   */
  async update(entity: T, entityManager?: EntityManager): Promise<T> {
    return this.updateWithCompare(entity, await this.findByIdAndCheck(entity.id), entityManager);
  }

  async updatePartial(id: string, entity: Partial<T>, entityManager?: EntityManager): Promise<T> {
    entity.id = id;
    return this.updateWithCompare(entity, await this.findByIdAndCheck(id), entityManager);
  }

  /**
   * Compare the DB entity and update it
   * Use to check property metadata including {@link BlNotUpdatable}
   * @protected
   */
  public async updateWithCompare(
    newEntity: Partial<T>,
    dbEntity: T,
    entityManager?: EntityManager
  ): Promise<T> {
    for (const property in newEntity) {
      // check if the property is updatable or is undefined
      if (!blPropertyIsNotUpdatable(dbEntity, property) && newEntity[property] !== undefined) {
        // if not set the value of the db (if undefined it won't be updated)
        dbEntity[property] = newEntity[property];
      }
    }

    return await this.getEntityManager(entityManager).save(dbEntity);
  }

  async deleteById(id: string, entityManager?: EntityManager): Promise<DeleteResult> {
    return await this.getEntityManager(entityManager).delete(this.entityClass, id);
  }

  findById(
    id: string,
    relations?: FindOptionsRelations<T>,
    entityManager?: EntityManager
  ): Promise<T | null> {
    if (id == null) {
      throw new BlBadRequestException('Id not provided');
    }

    // const options: FindOneOptions<T> = {where
    return this.getEntityManager(entityManager).findOne(this.entityClass, {
      where: { id: id },
      relations: relations,
    } as FindOneOptions<T>);
  }

  async findByIdAndCheck(
    id: string,
    relations?: FindOptionsRelations<T>,
    entityManager?: EntityManager
  ): Promise<T> {
    const entity: T = await this.findById(id, relations, entityManager);
    if (entity == null) {
      throw new BlNotFoundException(`Object '${this.entityClass.name}' with id ${id} not found`);
    }
    return entity;
  }
}
