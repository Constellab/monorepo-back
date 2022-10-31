import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {CaMySmartDbsPageComponent} from './ca-my-smart-dbs-page/ca-my-smart-dbs-page.component';
import {CaCoreModule} from '../../ca-core/ca-core.module';
import {CaSmartDbCoreModule} from '../../ca-core/entity-module/ca-smart-db-core/ca-smart-db-core.module';

@NgModule({
  declarations: [
    CaMySmartDbsPageComponent,
  ],
  imports: [
    CommonModule,

    CaCoreModule,
    CaSmartDbCoreModule,
  ]
})
export class CaMySmartDbsPageModule {
}
