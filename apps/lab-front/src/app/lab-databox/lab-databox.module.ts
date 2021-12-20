import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {LabDataboxRoutingModule} from './lab-databox-routing.module';
import {LabResourceSearchPageModule} from './module/lab-resource-search-page/lab-resource-search-page.module';


@NgModule({
  declarations: [],
  imports: [
    CommonModule,

    LabResourceSearchPageModule,

    LabDataboxRoutingModule,
  ]
})
export class LabDataboxModule {
}
