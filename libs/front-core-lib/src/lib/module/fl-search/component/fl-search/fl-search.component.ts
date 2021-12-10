import {Component, OnInit, ViewChild} from '@angular/core';
import {FlSavedSearch} from '../../model/fl-saved-search.class';
import {FlSearchState} from '../../model/fl-search.state';
import {FlDatasourcePaginated} from '../../../../model/datasource/fl-datasource-paginated.class';
import {MatDrawer} from '@angular/material/sidenav';

/**
 * Search component with a header, a drawer search on the right and result in table on bottom
 *
 * The FlSearchState must be provided and configured and the Fl_SeARCH_CONFIG must also be provided.
 */
@Component({
  selector: 'fl-search',
  templateUrl: './fl-search.component.html',
  styleUrls: ['./fl-search.component.scss']
})
export class FlSearchComponent implements OnInit {

  @ViewChild(MatDrawer, {static: true}) drawer: MatDrawer;

  datasource: FlDatasourcePaginated<any>;

  constructor(private searchState: FlSearchState<any>) {
  }

  ngOnInit(): void {
    this.datasource = this.searchState.datasource;
    this.searchState.setDrawer(this.drawer);
  }

  toggleDrawer(): void {
    this.searchState.toggleDrawer();
  }

  loadMoreResults(): void {
    this.datasource.getNextPage();
  }

  callSavedSearch(savedSearch: FlSavedSearch): void {
    this.searchState.callAdvancedSearchFromSavedSearch(savedSearch);
  }

}
