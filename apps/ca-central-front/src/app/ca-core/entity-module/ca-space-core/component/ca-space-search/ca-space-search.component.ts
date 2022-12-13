import {Component, OnInit} from '@angular/core';
import {
  FlConfirmDialogInput,
  FlDialogService,
  FlEntityPaginatedDatasource,
  FlFormDialogInput,
  FlSavedSearch,
  FlSearchConfig,
  FlSearchState,
  FlTableColumn,
  FlThemeService
} from '@monorepo/front-core-lib';
import {CaSpaceService} from '../../../../service-api/ca-space.service';
import {CaSpaceSearch, CaSpaceSearchFields} from '../../model/ca-space-search.class';
import {CaSpace, CaSpaceDatasource} from '../../../../model/entities/space/ca-space.class';
import {CaSpaceFormDialogComponent} from '../ca-space-form-dialog/ca-space-form-dialog.component';


@Component({
  selector: 'ca-space-search',
  templateUrl: './ca-space-search.component.html',
  styleUrls: ['./ca-space-search.component.scss'],
  providers: [FlSearchState]
})
export class CaSpaceSearchComponent implements OnInit {

  datasource: CaSpaceDatasource;

  columns: FlTableColumn<CaSpace>[] = ['name', 'created', 'lastModified', 'type', 'detail'];


  constructor(private searchState: FlSearchState<any>,
              private spaceService: CaSpaceService,
              private themeService: FlThemeService,
              private dialogService: FlDialogService) {
  }

  ngOnInit(): void {
    const config: FlSearchConfig = {
      version: 1,
      buildAdvancedForm: CaSpaceSearch.getAdvancedSearchForm,
      advancedFormClass: CaSpaceSearchFields,
      savedSearch: this.getSavedSearch(),
      advancedFormManager: {
        config: CaSpaceSearch.advancedSearchManagerConfig,
      },
      storeSearchInUrl: true
    };

    this.datasource = new FlEntityPaginatedDatasource(
      (page, size, filters) => this.spaceService.search(page, size, filters),
      20, false);
    this.searchState.init(config, this.datasource);
  }

  private getSavedSearch(): FlSavedSearch[] {
    return [{
      searchName: 'ca-space',
      id: null,
      label: 'All spaces',
      color: this.themeService.getCurrentThemeDetail().primary,
      version: 1,
      default: true,
      filtersCriteria: {} as Partial<CaSpaceSearchFields>
    }];
  }

  createSpace(): void {
    const input: FlFormDialogInput = {
      mode: 'create'
    };

    this.dialogService.openSmallDialog(CaSpaceFormDialogComponent, {data: input}).afterClosed().subscribe(
      version => this.onCreateClosed(version)
    );
  }

  private onCreateClosed(space?: CaSpace): void {
    if (space) {
      this.datasource.addItem(space, () => true);
    }
  }

  generateAllUserPersonalSpaces(): void {
    const data: FlConfirmDialogInput = {
      title: 'generate_all_user_space',
      content: 'generate_all_user_space_confirmation',
      translateTitleAndContent: true,
      observable: this.spaceService.generateAllUserPersonalSpace(),
      successMessage: 'all_user_space_generated',
      translateMessage: true
    };

    this.dialogService.openConfirmDialog(data);
  }


}
