import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {
  BioxTransformResourcePortalComponent
} from './component/biox-transform-resource-portal/biox-transform-resource-portal.component';
import {BioxTransformResourceComponent} from './component/biox-transform-resource/biox-transform-resource.component';
import {BioxProcessCoreModule} from '../biox-process-core/biox-process-core.module';
import {CoreModule} from '../../core.module';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {BioxConfigCoreModule} from '../biox-config-core/biox-config-core.module';


/**
 * Module to handle Transformer process
 */
@NgModule({
  declarations: [
    BioxTransformResourcePortalComponent,
    BioxTransformResourceComponent
  ],
  exports: [
    BioxTransformResourceComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,

    CoreModule,
    BioxProcessCoreModule,
    BioxConfigCoreModule,
  ]
})
export class BioxTransformerModule {
}
