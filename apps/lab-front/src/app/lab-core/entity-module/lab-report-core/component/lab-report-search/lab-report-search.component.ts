import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {
  FL_SEARCH_CONFIG,
  FlDatasourcePaginated,
  FlDialogService,
  FlSavedSearch,
  FlSearchConfig,
  FlSearchService,
  FlSearchState,
  FlTableColumn,
  flThemeDetailLight
} from '@monorepo/front-core-lib';
import {LabReportSearch, LabReportSearchFields} from '../../model/lab-report-advanced-search.class';
import {LabReport} from '../../../../model/entities/lab-report.entity';
import {LabReportService} from '../../../../entity-service/lab-report.service';
import {LabRouterService} from '../../../../service/lab-router.service';
import {
  LabReportFormDialogComponent,
  LabReportFormDialogInput
} from '../lab-report-form-dialog/lab-report-form-dialog.component';

const savedSearch: FlSavedSearch[] = [{
  searchName: 'lab-report',
  id: null,
  label: 'Reports',
  color: flThemeDetailLight.primary,
  version: 1,
  default: true,
  filtersCriteria: {isValidated: false} as Partial<LabReportSearchFields>
}];

/**
 * Configuration factory for the
 * */
function searchConfig(searchService: FlSearchService<any>): FlSearchConfig {
  return {
    version: 1,
    searchService: searchService,
    buildAdvancedForm: LabReportSearch.getAdvancedSearchForm,
    advancedFormClass: LabReportSearchFields,
    savedSearch: savedSearch,
    advancedSearchFormManagerConfig: LabReportSearch.advancedSearchManagerConfig
  };
}


@Component({
  selector: 'lab-report-search',
  templateUrl: './lab-report-search.component.html',
  styleUrls: ['./lab-report-search.component.scss'],
  providers: [
    FlSearchState,
    {provide: FL_SEARCH_CONFIG, useFactory: searchConfig, deps: [LabReportService]}
  ]
})
export class LabReportSearchComponent implements OnInit {

  @Input() reportSelectable: boolean = false;

  @Input() fullPageSearch: boolean = true;

  @Output() reportSelected: EventEmitter<LabReport> = new EventEmitter();

  datasource: FlDatasourcePaginated<LabReport>;

  columns: FlTableColumn<LabReport>[] = ['title', 'createdAt'];

  constructor(private searchState: FlSearchState<any>,
              private reportService: LabReportService,
              private routerService: LabRouterService,
              private dialogService: FlDialogService) {
  }

  ngOnInit(): void {
    this.datasource = this.searchState.datasource;
    this.searchState.init(this.fullPageSearch);
  }

  openCreateReportFormDialog(): void {
    const input: LabReportFormDialogInput = {
      mode: 'create'
    };

    this.dialogService.openSmallDialog(LabReportFormDialogComponent, {data: input}).afterClosed().subscribe(
      report => this.onFormClosed(report)
    );
  }

  private onFormClosed(report?: LabReport): void {
    if (report) {
      this.routerService.navigateToReportDetail(report.id);
    }
  }

  selectReport(report: LabReport): void {
    this.reportSelected.next(report);
  }
}
