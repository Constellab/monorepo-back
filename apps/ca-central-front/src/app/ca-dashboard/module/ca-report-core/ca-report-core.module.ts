import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {CaReportCardComponent} from './component/ca-report-card/ca-report-card.component';
import {CaCoreModule} from '../../../ca-core/ca-core.module';
import {CaReportsListComponent} from './component/ca-reports-list/ca-reports-list.component';
import {RouterModule} from '@angular/router';
import {CaReportContentViewComponent} from './component/ca-report-content-view/ca-report-content-view.component';

/**
 * Core module for Report entity
 */
@NgModule({
  declarations: [
    CaReportCardComponent,
    CaReportsListComponent,
    CaReportContentViewComponent,
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
  ]
})
export class CaReportCoreModule {
}
