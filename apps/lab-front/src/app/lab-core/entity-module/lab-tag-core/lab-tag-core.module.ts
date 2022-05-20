import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {LabCoreModule} from '../../lab-core.module';
import {LabTagDashboardComponent} from './component/lab-tag-dashboard/lab-tag-dashboard.component';
import {LabTagDetailComponent} from './component/lab-tag-detail/lab-tag-detail.component';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';


@NgModule({
  declarations: [
    LabTagDashboardComponent,
    LabTagDetailComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,

    LabCoreModule,
  ],
  exports: [
    LabTagDashboardComponent,
    LabTagDetailComponent
  ]
})
export class LabTagCoreModule { }
