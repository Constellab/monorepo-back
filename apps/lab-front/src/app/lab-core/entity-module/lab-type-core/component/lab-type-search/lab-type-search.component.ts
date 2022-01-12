import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {
  FL_SEARCH_CONFIG,
  FlSavedSearch,
  FlSearchConfig,
  FlSearchService,
  FlSearchState,
  FlTableColumn,
  flThemeDetailLight
} from '@monorepo/front-core-lib';
import {LabTypeSearch, LabTypeSearchFields} from '../../model/lab-type-advanced-search.class';
import {LabTypeEntity, LabTypeEntityDatasource} from '../../../../model/entities/lab-type/lab-type.entity';
import {LabTypeService} from '../../../../entity-service/lab-type.service';

// list of predefined search of the resources
const savedSearch: FlSavedSearch[] = [{
  searchName: 'biox-resource',
  id: null,
  label: 'Core',
  color: flThemeDetailLight.primary,
  version: 1,
  default: true,
  filtersCriteria: {brick:['gws_core']} as Partial<LabTypeSearchFields>
}];

/**
 * Configuration factory for the
 * */
function searchConfig(searchService: FlSearchService<any>): FlSearchConfig {
  return {
    version: 1,
    searchService: searchService,
    buildAdvancedForm: LabTypeSearch.getAdvancedSearchForm,
    advancedFormClass: LabTypeSearchFields,
    savedSearch: savedSearch,
    advancedSearchFormManagerConfig: LabTypeSearch.advancedSearchManagerConfig
  };
}


@Component({
  selector: 'lab-type-search',
  templateUrl: './lab-type-search.component.html',
  styleUrls: ['./lab-type-search.component.scss'],
  providers: [
    FlSearchState,
    {provide: FL_SEARCH_CONFIG, useFactory: searchConfig, deps: [LabTypeService]}
  ]
})
export class LabTypeSearchComponent implements OnInit {

  @Input() fullPageSearch: boolean = false;

  @Output() typeSelected: EventEmitter<LabTypeEntity> = new EventEmitter();

  columns: FlTableColumn<LabTypeEntity>[] = [{columnName: 'name', accessor: 'humanName'}, {
    columnName: 'description',
    accessor: 'shortDescription'
  }, 'detail'];
  datasource: LabTypeEntityDatasource;

  constructor(private searchState: FlSearchState<any>) {
  }

  ngOnInit(): void {
    this.datasource = this.searchState.datasource;
    this.searchState.init(this.fullPageSearch);
  }

  selectType(type: LabTypeEntity): void {
    this.typeSelected.next(type);
  }

}
