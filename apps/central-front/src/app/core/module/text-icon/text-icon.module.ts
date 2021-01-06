import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FlexLayoutModule} from '@angular/flex-layout';
import {TextIconComponent} from './text-icon/text-icon.component';

/**
 * Module that contain the TextIconComponent to align text with icon
 */
@NgModule({
  declarations: [
    TextIconComponent
  ],
  exports: [
    TextIconComponent,
  ],
  imports: [
    CommonModule,

    FlexLayoutModule,
  ]
})
export class TextIconModule {
}
