import {BlSearchFilterCriteria, BlSearchOperatorStr, BlSearchParams, BlSearchSortCriteria} from './bl-search.class';
import {Between, In, IsNull, LessThan, LessThanOrEqual, Like, MoreThan, MoreThanOrEqual, Not} from 'typeorm';
import {FindOptionsOrder, FindOptionsOrderValue} from 'typeorm/find-options/FindOptionsOrder';
import {FindOneOptions} from 'typeorm/find-options/FindOneOptions';
import {FindOptionsWhere} from 'typeorm/find-options/FindOptionsWhere';
import {FindOptionsRelations} from 'typeorm/find-options/FindOptionsRelations';

export class BlSearchBuilder<T> {

  private whereOptions: FindOptionsWhere<T> = {};
  private orderOptions: FindOptionsOrder<T> = {};
  private relations: FindOptionsRelations<T> = {};


  public addSearchParams(searchParams: BlSearchParams): void {
    if (searchParams.filtersCriteria) {
      for (const filter of searchParams.filtersCriteria) {
        this.addSearchCriteria(filter);
      }
    }

    if (searchParams.sortsCriteria) {
      for (const sort of searchParams.sortsCriteria) {
        this.addSortCriteria(sort);
      }
    }
  }


  public mergeWhereOptions(where: FindOptionsWhere<T>): void {
    this.whereOptions = {
      ...this.whereOptions,
      ...where
    };
  }

  public mergeOrderOptions(order: FindOptionsOrder<T>): void {
    this.orderOptions = {
      ...this.orderOptions,
      ...order
    };
  }

  public setRelations(relations: FindOptionsRelations<T>): void {
    this.relations = relations;
  }

  public build(): FindOneOptions<T> {
    return {
      where: this.whereOptions,
      order: this.orderOptions,
      relations: this.relations
    };
  }

  private addSearchCriteria(filter: BlSearchFilterCriteria): void {
    // the keys are separated by dot
    const keys = filter.key.split('.');

    let currentCondition = this.whereOptions;
    // build the filter object
    for (let i = 0; i < keys.length; i++) {
      if (i === keys.length - 1) {
        currentCondition[keys[i]] = this.convertFilterValue(filter.operator, filter.value);
      } else {
        if (currentCondition[keys[i]] == null) {
          currentCondition[keys[i]] = {};
        }
      }
      currentCondition = currentCondition[keys[i]];
    }
  }


  private convertFilterValue(operator: BlSearchOperatorStr, value: any): any {
    switch (operator) {
      case 'EQ':
        return value;
      case 'NEQ':
        return Not(value);
      case 'LT':
        return LessThan(value);
      case 'LE':
        return LessThanOrEqual(value);
      case 'GT':
        return MoreThan(value);
      case 'GE':
        return MoreThanOrEqual(value);
      case 'CONTAINS':
        return Like(`%${value}%`);
      case 'IN':
        return In(value);
      case 'NOT_IN':
        return Not(In(value));
      case 'NULL':
        return IsNull();
      case 'NOT_NULL':
        return Not(IsNull());
      case 'START_WITH':
        return Like(value + '%');
      case 'END_WITH':
        return Like('%' + value);
      case 'MATCH':
        return Like('%' + value + '%');
      case 'BETWEEN':
        return Between(value[0], value[1]);
    }
  }

  private addSortCriteria(sort: BlSearchSortCriteria): void {
    // the keys are separated by dot
    const keys = sort.key.split('.');

    let currentOrder = this.orderOptions;
    // build the filter object
    for (let i = 0; i < keys.length; i++) {
      if (i === keys.length - 1) {
        currentOrder[keys[i]] = sort.order as FindOptionsOrderValue;
      } else {
        if (currentOrder[keys[i]] == null) {
          currentOrder[keys[i]] = {};
        }
      }
      currentOrder = currentOrder[keys[i]];
    }
  }


}
