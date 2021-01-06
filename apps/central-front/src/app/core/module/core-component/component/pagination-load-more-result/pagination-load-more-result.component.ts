import {ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, OnInit} from '@angular/core';
import {DatasourcePaginated} from '../../../../model/datasource/datasource-paginated.class';

/**
 * Component link to a paginated datasource to show the text 'Load more result' and trigger load
 * or show no more result text in page is last
 */
@Component({
  selector: 'gen-pagination-load-more-result',
  templateUrl: './pagination-load-more-result.component.html',
  styleUrls: ['./pagination-load-more-result.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PaginationLoadMoreResultComponent implements OnInit {

  @Input() datasource: DatasourcePaginated<any>;

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
