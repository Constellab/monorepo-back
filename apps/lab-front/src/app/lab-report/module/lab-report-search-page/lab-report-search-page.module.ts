import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {LabReportSearchPageComponent} from './component/lab-report-search-page/lab-report-search-page.component';
import {LabReportCoreModule} from '../../../lab-core/entity-module/lab-report-core/lab-report-core.module';


@NgModule({
  declarations: [
    LabReportSearchPageComponent
  ],
  imports: [
    CommonModule,

    LabReportCoreModule,
  ]
})
export class LabReportSearchPageModule { }
