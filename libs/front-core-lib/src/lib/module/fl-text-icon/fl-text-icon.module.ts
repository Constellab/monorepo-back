import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FlexLayoutModule} from '@angular/flex-layout';
import {FlTextIconComponent} from './fl-text-icon/fl-text-icon.component';
import {FlTextOkNokComponent} from './fl-text-ok-nok/fl-text-ok-nok.component';
import {MatIconModule} from '@angular/material/icon';

/**
 * Module that contain the TextIconComponent to align text with icon
 */
@NgModule({
  declarations: [
    FlTextIconComponent,
    FlTextOkNokComponent
  ],
  exports: [
    FlTextIconComponent,
    FlTextOkNokComponent,
  ],
  imports: [
    CommonModule,

    FlexLayoutModule,
    MatIconModule,
  ]
})
export class FlTextIconModule {
}
