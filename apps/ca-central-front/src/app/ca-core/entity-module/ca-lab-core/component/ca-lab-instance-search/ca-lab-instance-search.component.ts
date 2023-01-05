import {Component, Input, OnInit} from '@angular/core';
import {
  FlDialogService,
  FlEntityPaginatedDatasource,
  FlSavedSearch,
  FlSearchConfig,
  FlSearchState,
  FlTableColumn,
  FlThemeService
} from '@monorepo/front-core-lib';
import {CaLabInstance, CaLabInstanceDatasource} from '../../../../model/entities/lab/ca-lab-instance.class';
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

  /**
   * Mode for the search
   * All --> search in all lab, only for admin
   * CurrentSpace --> search in the current space, only for space admin
   */
  @Input() mode: 'all' | 'current-space';

  datasource: CaLabInstanceDatasource;

  columns: FlTableColumn<CaLabInstance>[];


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

    this.datasource = this.getDatasource();
    this.searchState.init(config, this.datasource);

    this.columns = this.getColumns();
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

  private getDatasource(): CaLabInstanceDatasource {
    switch (this.mode) {
      case 'all':
        return new FlEntityPaginatedDatasource(
          (page, size, filters) => this.labInstanceService.searchAll(page, size, filters),
          20, false);
      case 'current-space':
        return new FlEntityPaginatedDatasource(
          (page, size, filters) => this.labInstanceService.searchInCurrentSpace(page, size, filters),
          20, false);
      default:
        throw new Error(`[CaLabInstanceSearchComponent] Unknown mode '${this.mode}'`);
    }
  }

  private getColumns(): FlTableColumn<CaLabInstance>[] {
    switch (this.mode) {
      case 'all':
        return ['name', 'space', 'currentStatus',
          {accessor: 'virtualHost', columnName: 'virtual_host'}, 'serverInfo', 'actions'];
      case 'current-space':
        return ['name', 'currentStatus',
          {accessor: 'virtualHost', columnName: 'virtual_host'}, 'serverInfo'];
      default:
        throw new Error(`[CaLabInstanceSearchComponent] Unknown mode '${this.mode}'`);
    }
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

  private onCreateLabInstanceClosed(labInstance?: CaLabInstance): void {
    if (labInstance) {
      this.datasource.unshiftItem(labInstance);
    }
  }
}
