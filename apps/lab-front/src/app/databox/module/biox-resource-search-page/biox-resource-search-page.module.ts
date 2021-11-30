import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {BioxResourceSearchPageComponent} from './component/biox-resource-search-page/biox-resource-search-page.component';
import {CoreModule} from '../../../core/core.module';
import {BioxResourceCoreModule} from '../../../core/entity-module/biox-resource-core/biox-resource-core.module';


@NgModule({
  declarations: [
    BioxResourceSearchPageComponent,
  ],
  imports: [
    CommonModule,

    CoreModule,


    BioxResourceCoreModule,
  ]
})
export class BioxResourceSearchPageModule {
}
