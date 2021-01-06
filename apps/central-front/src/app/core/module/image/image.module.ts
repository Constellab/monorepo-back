import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FlexLayoutModule} from '@angular/flex-layout';
import {RoundImageComponent} from './round-image/round-image.component';


/**
 * Module that contains Component to display Images.
 *
 * Contains: RoundImage
 */
@NgModule({
  declarations: [
    RoundImageComponent
  ],
  exports: [
    RoundImageComponent
  ],
  imports: [
    CommonModule,
    FlexLayoutModule,
  ]
})
export class ImageModule {
}
