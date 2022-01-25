import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {CaCoreModule} from '../ca-core/ca-core.module';
import {CaSmartDbRoutingModule} from './ca-smart-db-routing.module';
import {CaSmartDbCoreModule} from './ca-smart-db-core/ca-smart-db-core.module';
import {CaSmartDbSearchPageModule} from './ca-smart-db-search-page/ca-smart-db-search-page.module';
import {CaSmartDbDocPageModule} from './ca-smart-db-doc-page/ca-smart-db-doc-page.module';
import {CaSmartDbAdminPageModule} from './ca-smart-db-admin-page/ca-smart-db-admin-page.module';


@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,

    CaCoreModule,

    CaSmartDbCoreModule,
    CaSmartDbSearchPageModule,
    CaSmartDbDocPageModule,
    CaSmartDbAdminPageModule,

    CaSmartDbRoutingModule,
  ]
})
export class CaSmartDbModule {
}
