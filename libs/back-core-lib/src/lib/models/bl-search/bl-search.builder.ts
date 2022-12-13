import {BlSearchFilterCriteria, BlSearchOperatorStr, BlSearchParams, BlSearchSortCriteria} from './bl-search.class';
import {Between, In, IsNull, LessThan, LessThanOrEqual, Like, MoreThan, MoreThanOrEqual, Not} from 'typeorm';
import {FindOptionsOrderValue} from 'typeorm/find-options/FindOptionsOrder';
import {FindOneOptions} from 'typeorm/find-options/FindOneOptions';

export class BlSearchBuilder {


  public buildSearchParams(searchParams: BlSearchParams): FindOneOptions {
    const findOptions: FindOneOptions = {};
    if (searchParams.filtersCriteria) {
      findOptions.where = {};
      for (const filter of searchParams.filtersCriteria) {

        findOptions.where = {
          ...findOptions.where,
          ...this.convertFilterToWhere(filter)
        };
      }
    }

    if (searchParams.sortsCriteria) {
      findOptions.order = {};
      for (const sort of searchParams.sortsCriteria) {
        findOptions.order = {
          ...findOptions.order,
          ...this.convertSortToOrder(sort)
        };
      }
    }
    return findOptions;
  }

  private convertFilterToWhere(filter: BlSearchFilterCriteria): any {
    // the keys are separated by dot
    const keys = filter.key.split('.');

    const condition = {};
    let currentCondition = condition;
    // build the filter object
    for (let i = 0; i < keys.length; i++) {
      if (i === keys.length - 1) {
        currentCondition[keys[i]] = this.convertFilterValue(filter.operator, filter.value);
      } else {
        currentCondition[keys[i]] = {};
      }
      currentCondition = condition[keys[i]];
    }

    return condition;
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

  private convertSortToOrder(sort: BlSearchSortCriteria): any {
    // the keys are separated by dot
    const keys = sort.key.split('.');

    const order = {};
    let currentOrder = order;
    // build the filter object
    for (let i = 0; i < keys.length; i++) {
      if (i === keys.length - 1) {
        currentOrder[keys[i]] = sort.order as FindOptionsOrderValue;
      } else {
        currentOrder[keys[i]] = {};
      }
      currentOrder = order[keys[i]];
    }

    return order;
  }


}
