import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {
  FlEntityPaginatedDatasource,
  FlSavedSearch,
  FlSearchConfig,
  FlSearchState,
  FlTableColumn,
  FlTag,
  FlThemeService
} from '@monorepo/front-core-lib';
import {LabViewConfig, LabViewConfigDatasource} from '../../../../model/entities/resource/lab-view-config.entity';
import {LabViewConfigSearch, LabViewConfigSearchFields} from '../../model/lab-view-config-search.class';
import {LabViewConfigService} from '../../../../entity-service/lab-view-config.service';


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

  @Input() fullPageSearch: boolean = true;

  @Output() viewConfigSelected: EventEmitter<LabViewConfig> = new EventEmitter();

  datasource: LabViewConfigDatasource;

  columns: FlTableColumn<LabViewConfig>[];

  constructor(private searchState: FlSearchState<any>,
              private viewConfigService: LabViewConfigService,
              private themeService: FlThemeService) {
  }

  ngOnInit(): void {
    const config: FlSearchConfig = {
      version: 1,
      buildAdvancedForm: LabViewConfigSearch.getAdvancedSearchForm,
      advancedFormClass: LabViewConfigSearchFields,
      savedSearch: this.getSavedSearch(),
      advancedFormManager: {
        config: LabViewConfigSearch.advancedSearchManagerConfig,
        skipFalseBoolean: true
      },
      storeSearchInUrl: false
    };

    this.datasource = new FlEntityPaginatedDatasource(this.viewConfigService.getViewConfigSearchFunction(this.reportId),
      20, false);

    this.searchState.init(config, this.datasource);

    this.columns = ['title', 'resource', 'tags', 'preview', 'flagged'];
    // add the action column only when the search is in full page (view box)
    if (this.fullPageSearch) {
      this.columns.push('action');
    }

  }

  private getSavedSearch(): FlSavedSearch[] {
    // list of predefined search of the resources
    return [{
      searchName: 'lab-view-config',
      id: null,
      label: 'All views',
      color: this.themeService.getCurrentThemeDetail().primary,
      version: 1,
      default: true,
      filtersCriteria: {} as Partial<LabViewConfigSearchFields>
    }];
  }

  selectViewConfig(viewConfig: LabViewConfig): void {
    this.viewConfigSelected.next(viewConfig);
  }

  searchOnTag(tag: FlTag): void {
    const tags = this.searchState.advancedSearchFormGroup.value.tags ?? [];
    const newTags = [...tags, tag];
    const search: Partial<LabViewConfigSearchFields> = {
      tags: newTags
    };
    this.searchState.patchFormValueAndCallSearch(search);
  }


}
