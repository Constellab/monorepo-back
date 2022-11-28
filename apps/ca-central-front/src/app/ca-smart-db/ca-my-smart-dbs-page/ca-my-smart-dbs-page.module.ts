import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {CaMySmartDbsPageComponent} from './ca-my-smart-dbs-page/ca-my-smart-dbs-page.component';
import {CaCoreModule} from '../../ca-core/ca-core.module';
import {CaSmartDbCoreModule} from '../../ca-core/entity-module/ca-smart-db-core/ca-smart-db-core.module';
import {RouterModule} from '@angular/router';

@NgModule({
  declarations: [
    CaMySmartDbsPageComponent,
  ],
  imports: [
    CommonModule,
    RouterModule,

    CaCoreModule,
    CaSmartDbCoreModule,
  ]
})
export class CaMySmartDbsPageModule {
}
