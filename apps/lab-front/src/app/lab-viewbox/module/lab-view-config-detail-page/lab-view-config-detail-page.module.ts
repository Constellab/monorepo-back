import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {LabCoreModule} from '../../../lab-core/lab-core.module';
import {
  LabViewConfigDetailPageComponent
} from './component/lab-view-config-detail-page/lab-view-config-detail-page.component';
import {RouterModule} from '@angular/router';
import {LabResourceCoreModule} from '../../../lab-core/entity-module/lab-resource-core/lab-resource-core.module';


@NgModule({
  declarations: [
    LabViewConfigDetailPageComponent,
  ],
  imports: [
    CommonModule,
    RouterModule,

    LabCoreModule,
    LabResourceCoreModule,
  ]
})
export class LabViewConfigDetailPageModule {
}
