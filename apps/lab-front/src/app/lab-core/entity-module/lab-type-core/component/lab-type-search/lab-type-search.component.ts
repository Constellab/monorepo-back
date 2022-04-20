import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {
  FlSavedSearch,
  FlSearchConfig,
  FlSearchState,
  FlTableColumn,
  flThemeDetailLight
} from '@monorepo/front-core-lib';
import {LabTypeSearch, LabTypeSearchConfig, LabTypeSearchFields} from '../../model/lab-type-advanced-search.class';
import {LabTypeEntity, LabTypeEntityDatasource} from '../../../../model/entities/lab-type/lab-type.entity';
import {LabTypeService} from '../../../../entity-service/lab-type.service';
import {LabBrickGWS} from '../../../../model/entities/lab-brick.entity';

// list of predefined search of the resources
const savedSearch: FlSavedSearch[] = [
  {
    searchName: 'lab-type',
    id: null,
    label: 'All',
    color: flThemeDetailLight.primary,
    version: 1,
    default: true,
    filtersCriteria: {includeDeprecated: false} as Partial<LabTypeSearchFields>
  },
  {
    searchName: 'lab-type',
    id: null,
    label: 'Core',
    color: flThemeDetailLight.primary,
    version: 1,
    default: false,
    filtersCriteria: {brick: [LabBrickGWS.GWS_CORE], includeDeprecated: false} as Partial<LabTypeSearchFields>
  }
];

@Component({
  selector: 'lab-type-search',
  templateUrl: './lab-type-search.component.html',
  styleUrls: ['./lab-type-search.component.scss'],
  providers: [
    FlSearchState,
  ]
})
export class LabTypeSearchComponent implements OnInit {

  @Input() fullPageSearch: boolean = false;

  @Input() config: LabTypeSearchConfig;

  @Output() typeSelected: EventEmitter<LabTypeEntity> = new EventEmitter();

  columns: FlTableColumn<LabTypeEntity>[];
  datasource: LabTypeEntityDatasource;

  constructor(private searchState: FlSearchState<any>,
              private typeService: LabTypeService) {
  }

  ngOnInit(): void {

    // set hidden filters based on config
    let hiddenFilters: Partial<LabTypeSearchFields>;

    if (this.config.mode === 'taskOrProtocol') {
      hiddenFilters = {objectType: ['TASK', 'PROTOCOL']};
      this.columns = [
        'name',
        {columnName: 'description', accessor: 'shortDescription'},
        'objectSubType', 'detail'];
    } else {
      hiddenFilters = {
        objectType: ['TASK', 'PROTOCOL'],
        objectSubType: 'TRANSFORMER',
        relatedModelTypingName: this.config.resourceTypingName
      };
      // don't set the objectSubType because it is always transformers
      this.columns = [
        'name',
        {columnName: 'description', accessor: 'shortDescription'}, 'detail'];
    }
    this.searchState.setHiddenFilters(hiddenFilters);

    const config: FlSearchConfig = {
      version: 1,
      searchFunc: this.typeService.getAdvancedSearchFunction(),
      buildAdvancedForm: LabTypeSearch.getAdvancedSearchForm,
      advancedFormClass: LabTypeSearchFields,
      savedSearch: savedSearch,
      advancedSearchFormManagerConfig: LabTypeSearch.advancedSearchManagerConfig,
      storeSearchInUrl: this.fullPageSearch
    };
    this.searchState.init(config);
    this.datasource = this.searchState.datasource;
  }

  selectType(type: LabTypeEntity): void {
    this.typeSelected.next(type);
  }

}
