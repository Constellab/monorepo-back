import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {LabReportDetailPageComponent} from './component/lab-report-detail-page/lab-report-detail-page.component';
import {LabCoreModule} from '../../../lab-core/lab-core.module';
import {FormsModule} from '@angular/forms';
import {
  LabReportAssociatedExperimentsComponent
} from './component/lab-report-associated-experiments/lab-report-associated-experiments.component';
import {RouterModule} from '@angular/router';


@NgModule({
  declarations: [LabReportDetailPageComponent, LabReportAssociatedExperimentsComponent],
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,

    LabCoreModule,
  ]
})
export class LabReportDetailPageModule { }
