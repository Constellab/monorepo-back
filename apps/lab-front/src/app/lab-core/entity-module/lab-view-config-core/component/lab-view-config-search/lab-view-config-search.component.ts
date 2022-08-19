import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {
  FlDatasourcePaginated,
  FlSavedSearch,
  FlSearchConfig,
  FlSearchState,
  FlTableColumn,
  flThemeDetailLight
} from '@monorepo/front-core-lib';
import {LabViewConfig} from '../../../../model/entities/resource/lab-view-config.entity';
import {LabViewConfigSearch, LabViewConfigSearchFields} from '../../model/lab-view-config-search.class';
import {LabViewConfigService} from '../../../../entity-service/lab-view-config.service';

const savedSearch: FlSavedSearch[] = [{
  searchName: 'lab-view-config',
  id: null,
  label: 'All views',
  color: flThemeDetailLight.primary,
  version: 1,
  default: true,
  filtersCriteria: {} as Partial<LabViewConfigSearchFields>
}];

/**
 * Search on view config, only work for search linked to a report
 */
@Component({
  selector: 'lab-view-config-search',
  templateUrl: './lab-view-config-search.component.html',
  styleUrls: ['./lab-view-config-search.component.scss'],
  providers: [FlSearchState]
})
export class LabViewConfigSearchComponent implements OnInit {

  @Input() reportId: string;

  @Output() viewConfigSelected: EventEmitter<LabViewConfig> = new EventEmitter();

  datasource: FlDatasourcePaginated<LabViewConfig>;

  columns: FlTableColumn<LabViewConfig>[] = ['viewType', 'resource', 'title', 'createdAt', 'preview'];

  constructor(private searchState: FlSearchState<any>,
              private viewConfigService: LabViewConfigService) {
  }

  ngOnInit(): void {
    const config: FlSearchConfig = {
      version: 1,
      searchFunc: this.viewConfigService.getViewConfigSearchFunction(this.reportId),
      buildAdvancedForm: LabViewConfigSearch.getAdvancedSearchForm,
      advancedFormClass: LabViewConfigSearchFields,
      savedSearch: savedSearch,
      advancedSearchFormManagerConfig: LabViewConfigSearch.advancedSearchManagerConfig,
      storeSearchInUrl: false
    };
    this.searchState.init(config);
    this.datasource = this.searchState.datasource;
  }

  selectViewConfig(viewConfig: LabViewConfig): void {
    this.viewConfigSelected.next(viewConfig);
  }

}
