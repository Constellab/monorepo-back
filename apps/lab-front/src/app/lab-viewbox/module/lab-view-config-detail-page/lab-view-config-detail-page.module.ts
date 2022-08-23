import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {LabCoreModule} from '../../../lab-core/lab-core.module';
import {
  LabViewConfigCoreModule
} from '../../../lab-core/entity-module/lab-view-config-core/lab-view-config-core.module';
import {
  LabViewConfigDetailPageComponent
} from './component/lab-view-config-detail-page/lab-view-config-detail-page.component';
import {LabViewConfigDetailComponent} from './component/lab-view-config-detail/lab-view-config-detail.component';
import {LabEntityCoreModule} from '../../../lab-core/entity-module/lab-entity-core/lab-entity-core.module';
import {RouterModule} from '@angular/router';


@NgModule({
  declarations: [
    LabViewConfigDetailPageComponent,
    LabViewConfigDetailComponent
  ],
  imports: [
    CommonModule,
    RouterModule,

    LabCoreModule,
    LabViewConfigCoreModule,
    LabEntityCoreModule,
  ]
})
export class LabViewConfigDetailPageModule {
}
