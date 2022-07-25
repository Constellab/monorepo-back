import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {CaSyncObjectInfoComponent} from './component/ca-sync-object-info/ca-sync-object-info.component';
import {CaValidatedObjectInfoComponent} from './component/ca-validated-object-info/ca-validated-object-info.component';
import {CaCoreModule} from '../../../ca-core/ca-core.module';


@NgModule({
  declarations: [
    CaSyncObjectInfoComponent,
    CaValidatedObjectInfoComponent
  ],
  imports: [
    CommonModule,

    CaCoreModule,
  ],
  exports: [
    CaSyncObjectInfoComponent,
    CaValidatedObjectInfoComponent
  ]
})
export class CaDashboardCoreModule { }
