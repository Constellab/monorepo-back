import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {
  FlSavedSearch,
  FlSearchConfig,
  FLSearchFunction,
  FlSearchState,
  FlTableColumn,
  FlThemeService
} from '@monorepo/front-core-lib';
import {LabTypeSearch, LabTypeSearchConfig, LabTypeSearchFields} from '../../model/lab-type-advanced-search.class';
import {LabTypeEntity, LabTypeEntityDatasource} from '../../../../model/entities/lab-type/lab-type.entity';
import {LabTypeService} from '../../../../entity-service/lab-type.service';
import {LabBrickGWS} from '../../../../model/entities/lab-brick.entity';


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
              private typeService: LabTypeService,
              private themeService: FlThemeService) {
  }

  ngOnInit(): void {

    // set hidden filters based on config
    let hiddenFilters: Partial<LabTypeSearchFields>;
    let searchFunction: FLSearchFunction;

    switch (this.config.mode) {
      case 'process':
        searchFunction = this.typeService.getAdvancedSearchFunction();

        hiddenFilters = {objectType: ['TASK', 'PROTOCOL']};
        this.columns = [
          'name',
          {columnName: 'description', accessor: 'shortDescription'},
          'objectSubType', 'detail'];
        break;
      case 'transformer':
        searchFunction = this.typeService.getTransformerAdvancedSearchFunction(this.config.resourceTypingNames);

        // don't set the objectSubType because it is always transformers
        this.columns = [
          'name',
          {columnName: 'description', accessor: 'shortDescription'}, 'detail'];
        break;
      case 'importer':
        searchFunction = this.typeService.getImporterAdvancedSearchFunction(this.config.resourceTypingName,
          this.config.extension);

        // don't set the objectSubType because it is always importers
        this.columns = [
          'name',
          {columnName: 'description', accessor: 'shortDescription'}, 'detail'];
        break;
      case 'processSuggestion':
        searchFunction = this.typeService.getProcessSuggestion(this.config.resourceTypingNames, this.config.suggestBy);
        hiddenFilters = {objectType: ['TASK', 'PROTOCOL']};
        this.columns = [
          'name',
          {columnName: 'description', accessor: 'shortDescription'},
          'objectSubType', 'detail'];

    }


    this.searchState.setHiddenFilters(hiddenFilters);

    const config: FlSearchConfig = {
      version: 1,
      searchFunc: searchFunction,
      buildAdvancedForm: LabTypeSearch.getAdvancedSearchForm,
      advancedFormClass: LabTypeSearchFields,
      savedSearch: this.getSavedSearch(),
      advancedSearchFormManagerConfig: LabTypeSearch.advancedSearchManagerConfig,
      storeSearchInUrl: this.fullPageSearch
    };
    this.searchState.init(config);
    this.datasource = this.searchState.datasource;
  }

  private getSavedSearch(): FlSavedSearch[] {
    // list of predefined search of the resources
    return [{
      searchName: 'lab-type',
      id: null,
      label: 'All',
      color: this.themeService.getCurrentThemeDetail().primary,
      version: 1,
      default: true,
      filtersCriteria: {includeDeprecated: false} as Partial<LabTypeSearchFields>
    },
      {
        searchName: 'lab-type',
        id: null,
        label: 'Core',
        color: this.themeService.getCurrentThemeDetail().primary,
        version: 1,
        default: false,
        filtersCriteria: {brick: [LabBrickGWS.GWS_CORE], includeDeprecated: false} as Partial<LabTypeSearchFields>
      }];
  }

  selectType(type: LabTypeEntity): void {
    this.typeSelected.next(type);
  }

}
