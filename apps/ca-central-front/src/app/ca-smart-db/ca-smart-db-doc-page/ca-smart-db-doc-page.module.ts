import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {CaSmartDbDocCoreModule} from '../ca-smart-db-doc-core/ca-smart-db-doc-core.module';
import {CaCoreModule} from '../../ca-core/ca-core.module';
import {CaSmartDbDocPageComponent} from './component/ca-smart-db-doc-page/ca-smart-db-doc-page.component';

@NgModule({
  declarations: [CaSmartDbDocPageComponent],
  imports: [
    CommonModule,

    CaCoreModule,

    CaSmartDbDocCoreModule,
  ]
})
export class CaSmartDbDocPageModule {
}
