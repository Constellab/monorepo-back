import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {LabReportDetailPageComponent} from './component/lab-report-detail-page/lab-report-detail-page.component';
import {LabCoreModule} from '../../../lab-core/lab-core.module';
import {FormsModule} from '@angular/forms';


@NgModule({
  declarations: [LabReportDetailPageComponent],
  imports: [
    CommonModule,
    FormsModule,

    LabCoreModule,
  ]
})
export class LabReportDetailPageModule { }
