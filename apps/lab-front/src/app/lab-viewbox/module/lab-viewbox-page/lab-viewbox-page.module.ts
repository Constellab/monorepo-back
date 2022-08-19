import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {LabViewboxPageComponent} from './component/lab-viewbox-page/lab-viewbox-page.component';
import {LabCoreModule} from '../../../lab-core/lab-core.module';
import {
  LabViewConfigCoreModule
} from '../../../lab-core/entity-module/lab-view-config-core/lab-view-config-core.module';


@NgModule({
  declarations: [
    LabViewboxPageComponent
  ],
  imports: [
    CommonModule,

    LabCoreModule,
    LabViewConfigCoreModule,
  ]
})
export class LabViewboxPageModule { }
