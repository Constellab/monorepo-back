import {ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, OnInit} from '@angular/core';
import {FlDatasourcePaginated} from '../../../../model/datasource/fl-datasource-paginated.class';

/**
 * Component link to a paginated datasource to show the text 'Load more result' and trigger load
 * or show no more result text in page is last
 */
@Component({
  selector: 'fl-pagination-load-more-result',
  templateUrl: './fl-pagination-load-more-result.component.html',
  styleUrls: ['./fl-pagination-load-more-result.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FlPaginationLoadMoreResultComponent implements OnInit {

  @Input() datasource: FlDatasourcePaginated<any>;

  constructor(private cdr: ChangeDetectorRef) {
  }

  ngOnInit(): void {
    this.datasource.connect().subscribe(
      () => this.detectChange()
    );
  }

  private detectChange(): void {
    this.cdr.detectChanges();
  }

  loadMoreResults(): void {
    this.datasource.getNextPage();
  }
}
