import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {CoreModule} from '../../../core/core.module';
import {BioxResourceCoreModule} from '../../../core/entity-module/biox-resource-core/biox-resource-core.module';
import { BioxResourceDetailPageComponent } from './component/biox-resource-detail-page/biox-resource-detail-page.component';

/**
 * Simple module for the resource detail page
 */
@NgModule({
  declarations: [BioxResourceDetailPageComponent],
  imports: [
    CommonModule,

    CoreModule,
    BioxResourceCoreModule,
  ]
})
export class BioxResourceDetailPageModule {
}
