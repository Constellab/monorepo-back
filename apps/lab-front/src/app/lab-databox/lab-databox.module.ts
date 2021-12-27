import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {LabDataboxRoutingModule} from './lab-databox-routing.module';
import {LabResourceSearchPageModule} from './module/lab-resource-search-page/lab-resource-search-page.module';
import {LabResourceDetailPageModule} from './module/lab-resource-detail-page/lab-resource-detail-page.module';


@NgModule({
  declarations: [],
  imports: [
    CommonModule,

    LabResourceSearchPageModule,
    LabResourceDetailPageModule,

    LabDataboxRoutingModule,
  ]
})
export class LabDataboxModule {
}
