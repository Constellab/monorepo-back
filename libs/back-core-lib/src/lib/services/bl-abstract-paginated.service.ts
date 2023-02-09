import {EntityManager, Repository} from 'typeorm';
import {FindOneOptions} from 'typeorm/find-options/FindOneOptions';
import {FindManyOptions} from 'typeorm/find-options/FindManyOptions';
import {ClPage} from '@monorepo/core-lib';

export abstract class BlAbstractPaginatedService<T> {

  private readonly maxPageSize: number = 50;


  protected constructor(protected repo: Repository<T>,
                        protected entityClass: new() => T) {

  }

  static async findPaginatedStatic<T>(safePage: number = 0, safeSize: number = 10, options: FindOneOptions<T> = {},
                                      entityManager: EntityManager, entityClass: new() => T): Promise<ClPage<T>> {
    // build the options with the paginated filters
    const pageOptions: FindManyOptions<T> = {...options, skip: safePage * safeSize, take: safeSize};

    // get and count the total number of result
    const [result, totalElements] = await entityManager.findAndCount(entityClass, pageOptions);

    return ClPage.fromPagination(safePage, safeSize, totalElements, result);
  }

  async findPaginated(page: number = 0, size: number = 10, options: FindOneOptions<T> = {},
                      entityManager?: EntityManager): Promise<ClPage<T>> {
    const manager: EntityManager = this.getEntityManager(entityManager);

    const safePage: number = this.getSafePage(page);
    const safeSize: number = this.getSafePageSize(size);

    return BlAbstractPaginatedService.findPaginatedStatic(safePage, safeSize, options, manager, this.entityClass);
  }

  protected getSafePage(page: number): number {
    // must be a positive number
    return Math.max(page, 0);
  }

  protected getSafePageSize(size: number): number {
    // must be a positive number and be lower than maxPageSize
    return size < 0 ? 10 : (size > this.maxPageSize ? this.maxPageSize : size);
  }

  protected getEntityManager(entityManager?: EntityManager): EntityManager {
    return entityManager ?? this.repo.manager;
  }
}
