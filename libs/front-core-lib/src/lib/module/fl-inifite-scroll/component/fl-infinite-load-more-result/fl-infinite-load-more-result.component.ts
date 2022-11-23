import {Component, Input, OnInit} from '@angular/core';
import {FlDatasourcePaginated} from '../../../../model/datasource/fl-datasource-paginated.class';

/**
 * Component link to a paginated datasource to show the text 'Load more result' and trigger load
 * or show no more result text in page is last
 */
@Component({
  selector: 'fl-infinite-load-more-result',
  templateUrl: './fl-infinite-load-more-result.component.html',
  styleUrls: ['./fl-infinite-load-more-result.component.scss'],
})
export class FlInfiniteLoadMoreResultComponent implements OnInit {

  @Input() datasource: FlDatasourcePaginated<any>;

  /**
   * Text translated show if the datasource is empty.
   * Set empty string to hide the text
   */
  @Input() textNoResult: string = 'no_result';

  /**
   * Text translated showed if the last page is loaded and there is no more result
   * Set empty string to hide the text
   */
  @Input() textNoMoreResult: string = 'no_more_result';

  constructor() {
  }

  ngOnInit(): void {

  }

  loadMoreResults(): void {
    this.datasource.getNextPage();
  }

  get emptyText(): string {
    if(this.datasource.page.totalElements > 0){
      return this.textNoMoreResult;
    }else{
      return this.textNoResult;
    }
  }
}
