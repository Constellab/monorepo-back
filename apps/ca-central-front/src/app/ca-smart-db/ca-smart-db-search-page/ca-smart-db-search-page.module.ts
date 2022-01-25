import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {CaSmartDbCoreModule} from '../ca-smart-db-core/ca-smart-db-core.module';
import {CaCoreModule} from '../../ca-core/ca-core.module';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {CaSmartDbSearchPageComponent} from './component/ca-smart-db-search-page/ca-smart-db-search-page.component';
import {
  CaSmartDbSearchDocResultComponent
} from './component/ca-smart-db-search-doc-result/ca-smart-db-search-doc-result.component';
import {RouterModule} from '@angular/router';


@NgModule({
  declarations: [
    CaSmartDbSearchPageComponent,
    CaSmartDbSearchDocResultComponent,
  ],
  imports: [
    CommonModule,
    CaCoreModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule,

    CaSmartDbCoreModule,
  ]
})
export class CaSmartDbSearchPageModule {
}
