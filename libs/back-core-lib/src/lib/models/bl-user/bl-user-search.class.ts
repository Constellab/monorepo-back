import { ClPage } from '@monorepo/core-lib';
import { FindOptionsOrder, FindOptionsWhere, Like } from 'typeorm';
import { FindOptionsRelations } from 'typeorm/find-options/FindOptionsRelations';

import { BlAbstractPaginatedService } from '../../services/bl-abstract-paginated.service';
import { BlUser } from './bl-user.class';

/**
 * Abstract class to simplify smart search for user by name
 */
export abstract class BlUserSearch<T> {
  constructor(private service: BlAbstractPaginatedService<T>) {}

  protected abstract wrapFindOption(option: FindOptionsWhere<BlUser>): FindOptionsWhere<T>;

  protected abstract wrapOrderOption(option: FindOptionsOrder<BlUser>): FindOptionsOrder<T>;

  protected abstract getRelation(): FindOptionsRelations<T>;

  protected wrapMultipleFindOptions(options: FindOptionsWhere<BlUser>[]): FindOptionsWhere<T>[] {
    return options.map((option) => this.wrapFindOption(option));
  }

  private getOrder(): FindOptionsOrder<T> {
    return this.wrapOrderOption({ firstname: 'ASC', lastname: 'ASC' });
  }

  // Search by name
  public async smartSearchByName(name: string, page: number, size: number): Promise<ClPage<T>> {
    if (!name.includes(' ')) {
      return this.searchByLastnameOrFirstname(name, page, size);
    }

    // if there are 2 words, search by lastname and firstname
    // if nothing is found, search by lastname or firstname
    const names = name.split(' ');
    if (names.length === 2) {
      const result = await this.searchByLastnameAndFirstname(names[0], names[1], page, size);

      if (result.totalElements > 0) {
        return result;
      }
    }

    return this.searchByLastnameOrFirstname(name, page, size);
  }

  public searchByLastnameOrFirstname(name: string, page: number, size: number): Promise<ClPage<T>> {
    return this.service.findPaginated(page, size, {
      where: this.wrapMultipleFindOptions([
        { lastname: Like(`%${name}%`) },
        { firstname: Like(`%${name}%`) },
      ]),
      order: this.getOrder(),
      relations: this.getRelation(),
    });
  }

  public async searchByLastnameAndFirstname(
    name1: string,
    name2: string,
    page: number,
    size: number
  ): Promise<ClPage<T>> {
    return this.service.findPaginated(page, size, {
      where: this.wrapMultipleFindOptions([
        {
          lastname: Like(`%${name1}%`),
          firstname: Like(`%${name2}%`),
        },
        {
          lastname: Like(`%${name2}%`),
          firstname: Like(`%${name1}%`),
        },
      ]),
      order: this.getOrder(),
      relations: this.getRelation(),
    });
  }
}
