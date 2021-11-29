import {Component, OnInit, ViewChild} from '@angular/core';
import {
  FL_SEARCH_PAGE_CONFIG,
  FlDatasourcePaginated,
  FlSearchPageConfig,
  FlSearchService,
  FlSearchState,
  FlTableColumn
} from '@monorepo/front-core-lib';
import {BioxResourceSearch, BioxResourceSearchFields} from '../../model/biox-resource-advanced-search.class';
import {BioxResourceService} from '../../../../entity-service/biox-resource.service';
import {MatDrawer} from '@angular/material/sidenav';
import {BioxResource} from '../../../../model/entities/resource/biox-resource.entity';

/**
 * Configuration factory for the
 * */
function searchConfig(searchService: FlSearchService<any>): FlSearchPageConfig {
  return {
    searchService: searchService,
    buildAdvancedForm: BioxResourceSearch.getAdvancedSearchForm,
    advancedFormClass: BioxResourceSearchFields
  };
}

@Component({
  selector: 'gen-biox-resource-search',
  templateUrl: './biox-resource-search.component.html',
  styleUrls: ['./biox-resource-search.component.scss'],
  providers: [
    FlSearchState,
    {provide: FL_SEARCH_PAGE_CONFIG, useFactory: searchConfig, deps: [BioxResourceService]}
  ]

})
export class BioxResourceSearchComponent implements OnInit {

  @ViewChild(MatDrawer) drawer: MatDrawer;

  datasource: FlDatasourcePaginated<BioxResource>;

  columns: FlTableColumn<BioxResource>[] = ['id', 'name', 'info',
    {columnName: 'resource_type', accessor: 'resourceTypeHumanName'}, 'createdAt', 'action'];

  constructor(private searchState: FlSearchState<any>) {
  }

  ngOnInit(): void {
    this.searchState.setDrawer(this.drawer);
    this.datasource = this.searchState.datasource;
  }

  toggleDrawer(): void {
    this.drawer.toggle();
  }

  loadMoreResults(): void {
    this.datasource.getNextPage();
  }
}
