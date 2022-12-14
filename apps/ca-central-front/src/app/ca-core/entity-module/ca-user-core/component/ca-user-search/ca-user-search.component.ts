import {Component, OnInit} from '@angular/core';
import {
  FlEntityPaginatedDatasource,
  FlSavedSearch,
  FlSearchConfig,
  FlSearchState,
  FlTableColumn,
  FlThemeService
} from '@monorepo/front-core-lib';
import {CaUser, CaUserDatasourcePaginated} from '../../../../model/entities/ca-user.class';
import {CaUsersService} from '../../../../service-api/ca-users.service';
import {CaUserSearch, CaUserSearchFields} from '../../model/ca-user-search.class';

@Component({
  selector: 'ca-user-search',
  templateUrl: './ca-user-search.component.html',
  styleUrls: ['./ca-user-search.component.scss'],
  providers: [FlSearchState]
})
export class CaUserSearchComponent implements OnInit {

  datasource: CaUserDatasourcePaginated;

  columns: FlTableColumn<CaUser>[] = ['fullname', 'email', 'category', 'createdAt'];

  constructor(private searchState: FlSearchState<any>,
              private userService: CaUsersService,
              private themeService: FlThemeService) {
  }

  ngOnInit(): void {
    const config: FlSearchConfig = {
      version: 1,
      buildAdvancedForm: CaUserSearch.getAdvancedSearchForm,
      advancedFormClass: CaUserSearchFields,
      savedSearch: this.getSavedSearch(),
      advancedFormManager: {
        config: CaUserSearch.advancedSearchManagerConfig,
      },
      storeSearchInUrl: true
    };

    this.datasource = new FlEntityPaginatedDatasource((page, size, filters) => this.userService.search(page, size, filters)
      , 20, false);

    this.searchState.init(config, this.datasource);
  }

  private getSavedSearch(): FlSavedSearch[] {
    return [{
      searchName: 'ca-user',
      id: null,
      label: 'All users',
      color: this.themeService.getCurrentThemeDetail().primary,
      version: 1,
      default: true,
      filtersCriteria: {} as Partial<CaUserSearchFields>
    }];
  }
}
