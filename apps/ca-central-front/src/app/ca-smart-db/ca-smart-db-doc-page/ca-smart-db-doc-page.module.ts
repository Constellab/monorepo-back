import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {CaSmartDbCoreModule} from '../ca-smart-db-core/ca-smart-db-core.module';
import {CaCoreModule} from '../../ca-core/ca-core.module';
import {CaSmartDbDocPageComponent} from './component/ca-smart-db-doc-page/ca-smart-db-doc-page.component';

@NgModule({
  declarations: [CaSmartDbDocPageComponent],
  imports: [
    CommonModule,

    CaCoreModule,

    CaSmartDbCoreModule,
  ]
})
export class CaSmartDbDocPageModule {
}
