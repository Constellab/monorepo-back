import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {CaReportCardComponent} from './component/ca-report-card/ca-report-card.component';
import {CaCoreModule} from '../../../ca-core/ca-core.module';
import {CaReportsListComponent} from './component/ca-reports-list/ca-reports-list.component';
import {RouterModule} from '@angular/router';

/**
 * Core module for Report entity
 */
@NgModule({
  declarations: [
    CaReportCardComponent,
    CaReportsListComponent,
  ],
  exports: [
    CaReportCardComponent,
    CaReportsListComponent,
  ],
  imports: [
    CommonModule,
    RouterModule,

    CaCoreModule,
  ]
})
export class CaReportCoreModule {
}
