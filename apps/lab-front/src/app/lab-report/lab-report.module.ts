import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {LabReportRoutingModule} from './lab-report-routing.module';
import {LabReportSearchPageModule} from './module/lab-report-search-page/lab-report-search-page.module';
import {LabReportDetailPageModule} from './module/lab-report-detail-page/lab-report-detail-page.module';


@NgModule({
  declarations: [],
  imports: [
    CommonModule,

    LabReportSearchPageModule,
    LabReportDetailPageModule,

    LabReportRoutingModule,
  ]
})
export class LabReportModule {
}
