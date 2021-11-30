import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {DataboxRoutingModule} from './databox-routing.module';
import {BioxResourceSearchPageModule} from './module/biox-resource-search-page/biox-resource-search-page.module';


@NgModule({
  declarations: [],
  imports: [
    CommonModule,

    BioxResourceSearchPageModule,

    DataboxRoutingModule,
  ]
})
export class DataboxModule {
}
