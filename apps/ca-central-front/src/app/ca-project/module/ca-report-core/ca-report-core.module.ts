import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {CaReportCardComponent} from './component/ca-report-card/ca-report-card.component';
import {CaCoreModule} from '../../../ca-core/ca-core.module';
import {CaReportsListComponent} from './component/ca-reports-list/ca-reports-list.component';
import {RouterModule} from '@angular/router';
import {CaReportContentViewComponent} from './component/ca-report-content-view/ca-report-content-view.component';
import {CaReportTableComponent} from './component/ca-report-table/ca-report-table.component';
import {FlColorModule} from '@monorepo/front-core-lib';
import {CaProjectObjectCoreModule} from '../ca-project-object-core/ca-project-object-core.module';
import {CaReportContentComponent} from './component/ca-report-content/ca-report-content.component';
import {FormsModule} from '@angular/forms';

/**
 * Core module for Report entity
 */
@NgModule({
  declarations: [
    CaReportCardComponent,
    CaReportsListComponent,
    CaReportContentViewComponent,
    CaReportTableComponent,
    CaReportContentComponent,
  ],
  exports: [
    CaReportCardComponent,
    CaReportsListComponent,
    CaReportContentViewComponent,
    CaReportTableComponent,
    CaReportContentComponent,
  ],
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,

    CaCoreModule,
    CaProjectObjectCoreModule,

    FlColorModule,
  ]
})
export class CaReportCoreModule {
}
