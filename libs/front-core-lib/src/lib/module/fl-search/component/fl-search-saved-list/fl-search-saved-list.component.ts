import {Component, Inject, OnInit} from '@angular/core';
import {FlSavedSearch} from '../../model/fl-saved-search.class';
import {FlSearchState} from '../../model/fl-search.state';
import {FL_SEARCH_CONFIG, FlSearchConfig} from '../../model/fl-search-state-config.class';

/**
 * Works inside the {@link FlSearchComponent} to list the saved search and trigger search on click
 */
@Component({
  selector: 'fl-search-saved-list',
  templateUrl: './fl-search-saved-list.component.html',
  styleUrls: ['./fl-search-saved-list.component.scss']
})
export class FlSearchSavedListComponent implements OnInit {

  savedSearch: FlSavedSearch[];

  constructor(private searchState: FlSearchState<any>,
              @Inject(FL_SEARCH_CONFIG) config: FlSearchConfig) {
    this.savedSearch = config.savedSearch;
  }

  ngOnInit(): void {
  }

  callSavedSearch(savedSearch: FlSavedSearch): void {
    this.searchState.callAdvancedSearchFromSavedSearch(savedSearch);
  }

}
