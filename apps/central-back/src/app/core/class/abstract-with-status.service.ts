import {StatusHistory} from '../model/entities/status-history.entity';
import {EntityManager, getManager, Repository} from 'typeorm';
import {AbstractService} from './abstract.service';
import {EntityWithStatus} from '../model/entities/entity-with-status.entity';
import {BadRequestException} from '@nestjs/common';
import {ErrorText} from '../model/config/error-text.class';

/**
 * Service for {@link EntityWithStatus}
 * It contains a method to update the current status of the entity
 */
export abstract class AbstractWithStatusService<T extends EntityWithStatus<StatusHistory<S>>, S>
  extends AbstractService<T> {

  protected constructor(private entityRepo: Repository<T>,
                        entityClass: new() => T,
                        private statusHistoRepo: Repository<StatusHistory<S>>,
                        private statusHistoryReference: new() => StatusHistory<S>) {
    super(entityRepo, entityClass);
  }

  /**
   * Create the entity and set its current status
   */
  async createWithStatus(entity: T, status: S): Promise<T> {
    return await getManager().transaction(async entityManager => {
      return await this.createWithStatusTransaction(entity, status, entityManager);
    });
  }

  async createWithStatusTransaction(entity: T, status: S, transaction: EntityManager): Promise<T> {
    // create the entity without the status
    const dbEntity: T = await super.create(entity, transaction);

    return await this.createAndSetCurrentStatus(dbEntity, status, transaction);
  }

  protected async updateWithCompare(newEntity: T, dbEntity: T, entityManager?: EntityManager): Promise<T> {
    newEntity.currentStatus = dbEntity.currentStatus;
    return super.updateWithCompare(newEntity, dbEntity, entityManager);
  }

  /**
   * update the entity current status and closed previous status
   * @param status new status
   * @param id id of the entity
   */
  async updateCurrentStatus(status: S, id: string): Promise<T> {
    // get the entity with the current status
    return this.updateCurrentStatusWithDbEntity(status, await this.findByIdAndCheck(id));
  }

  /**
   * update the entity current status and closed previous status
   * need to send the db entity
   */
  async updateCurrentStatusWithDbEntity(status: S, dbEntity: T): Promise<T> {
    if (dbEntity.currentStatus.status === status) {
      throw new BadRequestException(ErrorText.STATUS_NOT_CHANGED);
    }

    return await getManager().transaction(async entityManager => {
      return await this.updateCurrentStatusWithDbEntityTransaction(status, dbEntity, entityManager);
    });
  }

  /**
   * update the entity current status and closed previous status with the current transaction
   * need to send the db entity
   */
  async updateCurrentStatusWithDbEntityTransaction(status: S, dbEntity: T, entityManager: EntityManager): Promise<T> {
    const oldStatus: StatusHistory<S> = dbEntity.currentStatus;
    oldStatus.endDate = new Date();
    await entityManager.save(oldStatus);

    return await this.createAndSetCurrentStatus(dbEntity, status, entityManager);
  }

  private async createAndSetCurrentStatus(dbEntity: T, status: S, entityManager: EntityManager): Promise<T> {
    // create the new status
    let newHistory: StatusHistory<S> = new this.statusHistoryReference();
    newHistory.entity = dbEntity;
    newHistory.status = status;
    newHistory = await entityManager.save(newHistory as any);

    // change the entity current status and save
    dbEntity.currentStatus = newHistory;
    return await super.updateWithCompare(dbEntity, dbEntity, entityManager);
  }

  /**
   * Get the histories of status for an entity
   */
  getStatusHistory(id: string): Promise<StatusHistory<S>[]> {
    return this.statusHistoRepo.find({
      where: {
        entity: {id: id}
      },
      order: {
        createdAt: 'DESC'
      }
    });
  }

  // private getEntityManager(entityManager?: EntityManager): EntityManager {
  //   return entityManager ?? getManager();
  // }
}
