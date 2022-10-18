import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {RouterModule} from '@angular/router';
import {CaCoreModule} from '../../../ca-core/ca-core.module';
import {CaSyncObjectInfoComponent} from './component/ca-sync-object-info/ca-sync-object-info.component';
import {CaValidatedObjectInfoComponent} from './component/ca-validated-object-info/ca-validated-object-info.component';

/**
 * Module that contains components for the project, experiment and report objects
 */
@NgModule({
  declarations: [
    CaSyncObjectInfoComponent,
    CaValidatedObjectInfoComponent,
  ],
  exports: [
    CaSyncObjectInfoComponent,
    CaValidatedObjectInfoComponent,
  ],
  imports: [
    CommonModule,
    RouterModule,

    CaCoreModule,
  ]
})
export class CaProjectObjectCoreModule {
}
