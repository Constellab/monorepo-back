import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FlexLayoutModule} from '@angular/flex-layout';
import {FlTextIconComponent} from './fl-text-icon/fl-text-icon.component';

/**
 * Module that contain the TextIconComponent to align text with icon
 */
@NgModule({
  declarations: [
    FlTextIconComponent
  ],
  exports: [
    FlTextIconComponent,
  ],
  imports: [
    CommonModule,

    FlexLayoutModule,
  ]
})
export class FlTextIconModule {
}
