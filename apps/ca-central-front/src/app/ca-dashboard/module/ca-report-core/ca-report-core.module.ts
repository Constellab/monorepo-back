import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {CaReportCardComponent} from './component/ca-report-card/ca-report-card.component';
import {CaCoreModule} from '../../../ca-core/ca-core.module';
import {CaReportsListComponent} from './component/ca-reports-list/ca-reports-list.component';
import {RouterModule} from '@angular/router';
import {CaReportContentViewComponent} from './component/ca-report-content-view/ca-report-content-view.component';
import {CaReportTableComponent} from './component/ca-report-table/ca-report-table.component';
import {FlColorModule} from '@monorepo/front-core-lib';
import {CaDashboardCoreModule} from '../ca-dashboard-core/ca-dashboard-core.module';

/**
 * Core module for Report entity
 */
@NgModule({
  declarations: [
    CaReportCardComponent,
    CaReportsListComponent,
    CaReportContentViewComponent,
    CaReportTableComponent,
  ],
  exports: [
    CaReportCardComponent,
    CaReportsListComponent,
    CaReportContentViewComponent,
  ],
  imports: [
    CommonModule,
    RouterModule,

    CaCoreModule,
    CaDashboardCoreModule,

    FlColorModule,
  ]
})
export class CaReportCoreModule {
}
