import {FlDatasourcePaginated} from './fl-datasource-paginated.class';
import {ClGetPageFunction, ClHelpService} from '@monorepo/core-lib';
import {FlEntity} from '../fl-entity.class';


export class FlEntityPaginatedDatasource<T extends FlEntity> extends FlDatasourcePaginated<T> {

  constructor(getPageFunction: ClGetPageFunction<T>, pageSize: number, initFirstPage: boolean = true) {
    super(getPageFunction, pageSize, initFirstPage);
  }

  protected equals(a: T, b: T): boolean {
    return ClHelpService.compareFnIds(a, b);
  }


}
