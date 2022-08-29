import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {
  LabTransformResourcePortalComponent
} from './component/lab-transform-resource-portal/lab-transform-resource-portal.component';
import {LabTransformResourceComponent} from './component/lab-transform-resource/lab-transform-resource.component';
import {LabCoreModule} from '../../lab-core.module';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {LabConfigCoreModule} from '../lab-config-core/lab-config-core.module';
import {LabTypeCoreModule} from '../lab-type-core/lab-type-core.module';


/**
 * Module to handle Transformer process
 */
@NgModule({
  declarations: [
    LabTransformResourcePortalComponent,
    LabTransformResourceComponent
  ],
  exports: [
    LabTransformResourceComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,

    LabCoreModule,
    LabTypeCoreModule,
    LabConfigCoreModule,
  ]
})
export class LabTransformerCoreModule {
}
