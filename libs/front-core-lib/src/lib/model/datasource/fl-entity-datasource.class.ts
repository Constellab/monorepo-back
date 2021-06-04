import {FlDatasourcePaginated} from './fl-datasource-paginated.class';
import {clGetEmptyPage, ClGetPageFunction, ClHelpService} from '@monorepo/core-lib';
import {FlEntity} from '../fl-entity.class';
import {of} from 'rxjs';


export class FlEntityPaginatedDatasource<T extends FlEntity> extends FlDatasourcePaginated<T> {

  constructor(getPageFunction: ClGetPageFunction<T>, pageSize: number, initFirstPage: boolean = true) {
    super(getPageFunction, pageSize, initFirstPage);
  }

  protected equals(a: T, b: T): boolean {
    return ClHelpService.compareFnIds(a, b);
  }


}

/**
 * Return an empty paginated datasource
 */
export function flGetEmptyPaginatedDatasource(): FlEntityPaginatedDatasource<any> {
  return new FlEntityPaginatedDatasource<any>(() => of(clGetEmptyPage()), 0);
}
