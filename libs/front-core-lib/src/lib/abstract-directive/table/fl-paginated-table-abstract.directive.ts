import {Directive, Input} from '@angular/core';
import {FlDatasourcePaginated} from '../../model/datasource/fl-datasource-paginated.class';
import {FlTableAbstractDirective} from './fl-table-abstract.directive';


@Directive()
export abstract class FlPaginatedTableAbstractDirective<T> extends FlTableAbstractDirective<T> {

  @Input() datasource: FlDatasourcePaginated<T>;

  getNextPage(): void {
    this.datasource.getNextPage();
  }
}
