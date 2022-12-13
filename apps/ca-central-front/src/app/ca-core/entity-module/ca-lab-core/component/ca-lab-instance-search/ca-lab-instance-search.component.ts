import {Component, OnInit} from '@angular/core';
import {
  FlDialogService,
  FlEntityPaginatedDatasource,
  FlSavedSearch,
  FlSearchConfig,
  FlSearchState,
  FlTableColumn,
  FlThemeService
} from '@monorepo/front-core-lib';
import {
  CaLabInstance,
  CaLabInstanceWithSpace,
  CaLabInstanceWithSpaceDatasource
} from '../../../../model/entities/ca-lab-instance.class';
import {CaLabInstanceService} from '../../../../service-api/ca-lab-instance.service';
import {CaLabInstanceSearch, CaLabInstanceSearchFields} from '../../model/ca-lab-instance-search.class';
import {
  CaLabInstanceFormDialogComponent,
  CaLabInstanceFormDialogInput
} from '../ca-lab-instance-form-dialog/ca-lab-instance-form-dialog.component';

@Component({
  selector: 'ca-lab-instance-search',
  templateUrl: './ca-lab-instance-search.component.html',
  styleUrls: ['./ca-lab-instance-search.component.scss'],
  providers: [FlSearchState]
})
export class CaLabInstanceSearchComponent implements OnInit {

  datasource: CaLabInstanceWithSpaceDatasource;

  columns: FlTableColumn<CaLabInstance>[] = ['name', 'space', 'currentStatus',
    {accessor: 'virtualHost', columnName: 'virtual_host'}, 'serverInfo', 'actions'];


  constructor(private searchState: FlSearchState<any>,
              private labInstanceService: CaLabInstanceService,
              private themeService: FlThemeService,
              private dialogService: FlDialogService) {
  }

  ngOnInit(): void {
    const config: FlSearchConfig = {
      version: 1,
      buildAdvancedForm: CaLabInstanceSearch.getAdvancedSearchForm,
      advancedFormClass: CaLabInstanceSearchFields,
      savedSearch: this.getSavedSearch(),
      advancedFormManager: {
        config: CaLabInstanceSearch.advancedSearchManagerConfig,
      },
      storeSearchInUrl: true
    };

    this.datasource = new FlEntityPaginatedDatasource(
      (page, size, filters) => this.labInstanceService.searchAll(page, size, filters),
      20, false);
    this.searchState.init(config, this.datasource);
  }

  private getSavedSearch(): FlSavedSearch[] {
    return [{
      searchName: 'ca-lab-instance',
      id: null,
      label: 'All labs',
      color: this.themeService.getCurrentThemeDetail().primary,
      version: 1,
      default: true,
      filtersCriteria: {} as Partial<CaLabInstanceSearchFields>
    }];
  }

  openCreateLabInstanceForm(): void {
    const dialogInput: CaLabInstanceFormDialogInput = {
      mode: 'create'
    };

    this.dialogService.openSmallDialog(CaLabInstanceFormDialogComponent, {data: dialogInput}).afterClosed()
      .subscribe(
        labInstance => this.onCreateLabInstanceClosed(labInstance)
      );
  }

  private onCreateLabInstanceClosed(labInstance?: CaLabInstanceWithSpace): void {
    if (labInstance) {
      this.datasource.unshiftItem(labInstance);
    }
  }
}
