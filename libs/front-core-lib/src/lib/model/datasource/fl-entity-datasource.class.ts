import {FlDatasourcePaginated} from './fl-datasource-paginated.class';
import {ClHelpService} from '@monorepo/core-lib';
import {FlEntity} from '../fl-entity.entity';
import {FlGetPageFunction} from '../fl-page.class';


export class FlEntityPaginatedDatasource<T extends FlEntity> extends FlDatasourcePaginated<T> {

  constructor(getPageFunction: FlGetPageFunction<T>, pageSize: number, initFirstPage: boolean = true) {
    super(getPageFunction, pageSize, initFirstPage);
  }

  protected equals(a: T, b: T): boolean {
    return ClHelpService.compareFnIds(a, b);
  }


}
