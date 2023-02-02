import {Component, OnInit} from '@angular/core';
import {
  FlEntityPaginatedDatasource,
  FlSavedSearch,
  FlSearchConfig,
  FlSearchState,
  FlTableColumn,
  FlThemeService
} from '@monorepo/front-core-lib';
import {CaProject, CaProjectDatasource} from '../../../../model/entities/project/ca-project.class';
import {CaProjectService} from '../../../../service-api/ca-project.service';
import {CaProjectSearch, CaProjectSearchFields} from '../../model/ca-project-search.class';

@Component({
  selector: 'ca-project-search',
  templateUrl: './ca-project-search.component.html',
  styleUrls: ['./ca-project-search.component.scss'],
  providers: [FlSearchState]

})
export class CaProjectSearchComponent implements OnInit {

  datasource: CaProjectDatasource;

  columns: FlTableColumn<CaProject>[] = ['code', 'title', 'status', 'leader', 'creation', 'actions'];

  constructor(private searchState: FlSearchState<any>,
              private projectService: CaProjectService,
              private themeService: FlThemeService) {
  }

  ngOnInit(): void {
    const config: FlSearchConfig = {
      version: 1,
      buildAdvancedForm: CaProjectSearch.getAdvancedSearchForm,
      advancedFormClass: CaProjectSearchFields,
      savedSearch: this.getSavedSearch(),
      advancedFormManager: {
        config: CaProjectSearch.advancedSearchManagerConfig,
        skipFalseBoolean: true
      },
      storeSearchInUrl: true
    };

    this.datasource = new FlEntityPaginatedDatasource(
      (page, size, filters) => this.projectService.searchInCurrentSpace(page, size, filters),
      20, false);
    this.searchState.init(config, this.datasource);
  }

  private getSavedSearch(): FlSavedSearch[] {
    return [{
      searchName: 'ca-project',
      id: null,
      label: 'All projects',
      color: this.themeService.getCurrentThemeDetail().primary,
      version: 1,
      default: true,
      filtersCriteria: {} as Partial<CaProjectSearchFields>
    }];
  }

}
