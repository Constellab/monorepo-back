import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {LabResourceSearchPageComponent} from './component/lab-resource-search-page/lab-resource-search-page.component';
import {LabCoreModule} from '../../../lab-core/lab-core.module';
import {LabResourceCoreModule} from '../../../lab-core/entity-module/lab-resource-core/lab-resource-core.module';


@NgModule({
  declarations: [
    LabResourceSearchPageComponent,
  ],
  imports: [
    CommonModule,

    LabCoreModule,


    LabResourceCoreModule,
  ]
})
export class LabResourceSearchPageModule {
}
