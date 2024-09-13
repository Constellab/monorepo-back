import { BlSearchFilterCriteria, BlSearchOperatorStr, BlSearchParams, BlSearchSortCriteria } from './bl-search.class';
import { Between, In, IsNull, LessThan, LessThanOrEqual, Like, MoreThan, MoreThanOrEqual, Not } from 'typeorm';
import { FindOptionsOrder, FindOptionsOrderValue } from 'typeorm/find-options/FindOptionsOrder';
import { FindOneOptions } from 'typeorm/find-options/FindOneOptions';
import { FindOptionsWhere } from 'typeorm/find-options/FindOptionsWhere';
import { FindOptionsRelations } from 'typeorm/find-options/FindOptionsRelations';
import { ClHelpService } from '@monorepo/core-lib';
import {
  CnFolder
} from '../../../../../../apps/cn-central-back/src/app/cn-folders-aggregate/cn-folders/cn-folder.entity';

export class BlSearchBuilder<T> {

  public whereOptions: FindOptionsWhere<T> = {};
  private orderOptions: FindOptionsOrder<T> = {};
  private relations: FindOptionsRelations<T> = {};

  private readonly defaultOrder: FindOptionsOrder<T>;

  constructor(defaultOrder: FindOptionsOrder<T> = {}) {
    this.defaultOrder = defaultOrder;
  }


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
    this.whereOptions = this.deepMergeWhereOptions(this.whereOptions, where);
  }

  /**
   * Method to merge two objects recursively
   * @param target
   * @param source
   */
  public deepMergeWhereOptions(target: any, source: any): any {
    if (typeof target !== 'object' || typeof source !== 'object') {
      return source;
    }

    // specific case, if the property is a FindOperator (like IsNull()), we don't merge
    if(source.hasOwnProperty('@instanceof')) return source;

    for (const key in source) {
      if (source.hasOwnProperty(key)) {
        if (source[key] instanceof Array) {
          if (!target[key]) {
            target[key] = [];
          }
          target[key] = target[key].concat(source[key]);
        } else if (source[key] instanceof Object) {
          if (!target[key]) {
            target[key] = {};
          }
          target[key] = this.deepMergeWhereOptions(target[key], source[key]);
        } else {
          target[key] = source[key];
        }
      }
    }

    return target;
  }

  public hasWhereOptions(key: keyof T): boolean {
    return this.whereOptions[key] !== undefined;
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
      order: !ClHelpService.isNullOrEmpty(this.orderOptions) ? this.orderOptions : this.defaultOrder,
      relations: this.relations
    };
  }

  protected addSearchCriteria(filter: BlSearchFilterCriteria): void {
    // the keys are separated by dot
    const keys = filter.key.split('.');

    let currentCondition: any = this.whereOptions;
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
      case 'MATCH':
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
      case 'BETWEEN':
        return Between(value[0], value[1]);
    }
  }

  protected addSortCriteria(sort: BlSearchSortCriteria): void {
    // the keys are separated by dot
    const keys = sort.key.split('.');

    let currentOrder: any = this.orderOptions;
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
