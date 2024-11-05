import { DeleteResult } from 'typeorm';
import { BlAbstractService, BlEntityWithId, BlUnauthorizedException } from '@monorepo/back-core-lib';

/**
 * Security layer between the controller and the service to check if the user can CRUD the entity
 */
export abstract class CnAbstractSecurityLayer<T extends BlEntityWithId> {
  protected constructor(private abstractService: BlAbstractService<T>) {}

  /**
   * Abstract Methods to check the CRUD authorization and return a boolean
   */
  public abstract isAuthorizedToCreate(newEntity: T): Promise<boolean>;

  public abstract isAuthorizedToUpdate(dbEntity: T): Promise<boolean>;

  public abstract isAuthorizedToDelete(dbEntity: T): Promise<boolean>;

  public abstract isAuthorizedToFindOne(dbEntity: T): Promise<boolean>;

  // same method with the id (this does a find one before calling the method with the entity)
  public async isAuthorizedToUpdateById(id: string): Promise<boolean> {
    const dbEntity: T = await this.abstractService.findByIdAndCheck(id);

    return this.isAuthorizedToUpdate(dbEntity);
  }

  public async isAuthorizedToDeleteById(id: string): Promise<boolean> {
    const dbEntity: T = await this.abstractService.findByIdAndCheck(id);

    return this.isAuthorizedToDelete(dbEntity);
  }

  public async isAuthorizedToFindById(id: string): Promise<boolean> {
    const dbEntity: T = await this.abstractService.findByIdAndCheck(id);

    return this.isAuthorizedToFindOne(dbEntity);
  }

  /**
   * Methods to check the CRUD authorization and call CnAbstractService crud operation
   * if the user is authorized for the operation
   */
  async createSecure(entity: T): Promise<T> {
    if (entity.id != null) {
      return this.updateSecure(entity);
    }

    await this.checkAuthorizationToCreate(entity);

    return this.abstractService.create(entity as any);
  }

  async updateSecure(entity: T): Promise<T> {
    if (entity.id == null) {
      return this.createSecure(entity);
    }

    const dbEntity: T = await this.getDbEntityForCheckUpdate(entity.id);

    await this.checkAuthorizationToUpdate(dbEntity);

    return this.abstractService.update(entity as any);
  }

  async deleteByIdSecure(id: string): Promise<DeleteResult> {
    const dbEntity: T = await this.getDbEntityForCheckDelete(id);

    await this.checkAuthorizationToDelete(dbEntity);

    return this.abstractService.deleteById(id);
  }

  async findByIdAndCheckSecure(id: string): Promise<T> {
    const dbEntity: T = await this.getDbEntityForCheckFindOne(id);

    await this.checkAuthorizationToFindOne(dbEntity);

    return dbEntity;
  }

  async findByIdAndCheck(id: string): Promise<T> {
    return await this.abstractService.findByIdAndCheck(id);
  }

  /**
   * Methods to check the CRUD authorization and throw a Unauthorized error
   * if the user is not authorized for the operation
   */
  public async checkAuthorizationToCreate(newEntity: T): Promise<void> {
    if (!(await this.isAuthorizedToCreate(newEntity))) {
      throw new BlUnauthorizedException();
    }
  }

  public async checkAuthorizationToUpdate(dbEntity: T): Promise<void> {
    if (!(await this.isAuthorizedToUpdate(dbEntity))) {
      throw new BlUnauthorizedException();
    }
  }

  public async checkAuthorizationToDelete(dbEntity: T): Promise<void> {
    if (!(await this.isAuthorizedToDelete(dbEntity))) {
      throw new BlUnauthorizedException();
    }
  }

  public async checkAuthorizationToFindOne(dbEntity: T): Promise<void> {
    if (!(await this.isAuthorizedToFindOne(dbEntity))) {
      throw new BlUnauthorizedException();
    }
  }

  /**
   * Methods to check the authorization based on entity id and
   * return the dbEntity if user is authorized
   */
  public async getAndCheckAuthorizationToUpdateById(id: string): Promise<T> {
    const dbEntity: T = await this.getDbEntityForCheckUpdate(id);

    if (!(await this.isAuthorizedToUpdate(dbEntity))) {
      throw new BlUnauthorizedException();
    }

    return dbEntity;
  }

  public async getAndCheckAuthorizationToDeleteById(id: string): Promise<T> {
    const dbEntity: T = await this.getDbEntityForCheckDelete(id);

    if (!(await this.isAuthorizedToDelete(dbEntity))) {
      throw new BlUnauthorizedException();
    }
    return dbEntity;
  }

  public async getAndCheckAuthorizationToFindById(id: string): Promise<T> {
    const dbEntity: T = await this.getDbEntityForCheckFindOne(id);

    if (!(await this.isAuthorizedToFindById(id))) {
      throw new BlUnauthorizedException();
    }
    return dbEntity;
  }

  /**
   * Methods to retrieve the DB entity for update, delete or findOne
   * They can be override to lot relations to check the permissions
   */
  protected async getDbEntityForCheckUpdate(id: string): Promise<T> {
    return await this.abstractService.findByIdAndCheck(id);
  }

  protected async getDbEntityForCheckDelete(id: string): Promise<T> {
    return await this.abstractService.findByIdAndCheck(id);
  }

  protected async getDbEntityForCheckFindOne(id: string): Promise<T> {
    return await this.abstractService.findByIdAndCheck(id);
  }
}
