import {DatasourcePaginated} from './datasource-paginated.class';
import {GetPageFunction} from '../global/page.class';
import {HelpService} from '../../utils/help-service';
import {Entity} from '../entities/entity.entity';


export class EntityPaginatedDatasource<T extends Entity> extends DatasourcePaginated<T> {

  constructor(getPageFunction: GetPageFunction<T>, pageSize: number, initFirstPage: boolean = true) {
    super(getPageFunction, pageSize, initFirstPage);
  }

  protected equals(a: T, b: T): boolean {
    return HelpService.compareFnIds(a, b);
  }


}
