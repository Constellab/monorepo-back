import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {LabCoreModule} from '../../../lab-core/lab-core.module';
import {
  LabViewConfigDetailPageComponent
} from './component/lab-view-config-detail-page/lab-view-config-detail-page.component';
import {RouterModule} from '@angular/router';
import {
  LabViewConfigCoreModule
} from '../../../lab-core/entity-module/lab-view-config-core/lab-view-config-core.module';


@NgModule({
  declarations: [
    LabViewConfigDetailPageComponent,
  ],
  imports: [
    CommonModule,
    RouterModule,

    LabCoreModule,
    LabViewConfigCoreModule,
  ]
})
export class LabViewConfigDetailPageModule {
}
