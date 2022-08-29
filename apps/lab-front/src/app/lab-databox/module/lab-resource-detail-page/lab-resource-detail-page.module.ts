import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {LabCoreModule} from '../../../lab-core/lab-core.module';
import {LabResourceCoreModule} from '../../../lab-core/entity-module/lab-resource-core/lab-resource-core.module';
import {LabResourceDetailPageComponent} from './component/lab-resource-detail-page/lab-resource-detail-page.component';
import {RouterModule} from '@angular/router';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {LabConfigCoreModule} from '../../../lab-core/entity-module/lab-config-core/lab-config-core.module';
import {
  LabTransformerCoreModule
} from '../../../lab-core/entity-module/lab-transformer-core/lab-transformer-core.module';

/**
 * Simple module for the resource detail page
 */
@NgModule({
  declarations: [
    LabResourceDetailPageComponent,
  ],
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    ReactiveFormsModule,

    LabCoreModule,
    LabResourceCoreModule,
    LabConfigCoreModule,
    LabTransformerCoreModule,
  ]
})
export class LabResourceDetailPageModule {
}
