import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FlColorSelectorComponent} from './component/fl-color-selector/fl-color-selector.component';
import {FlexLayoutModule} from '@angular/flex-layout';
import {MatIconModule} from '@angular/material/icon';
import {FlColorSelectorPortalComponent} from './component/fl-color-selector-portal/fl-color-selector-portal.component';
import {FlPortalModule} from '../fl-portal/fl-portal.module';
import {FormsModule} from '@angular/forms';
import {FlColorSelectorDirective} from './directive/fl-color-selector.directive';
import {FlStringToRgbPipe} from './pipe/fl-string-to-rgb/fl-string-to-rgb.pipe';


@NgModule({
  declarations: [
    FlColorSelectorComponent,
    FlColorSelectorPortalComponent,
    FlColorSelectorDirective,
    FlStringToRgbPipe
  ],
  exports: [
    FlColorSelectorComponent,
    FlColorSelectorDirective,
    FlStringToRgbPipe
  ],
  imports: [
    CommonModule,
    FormsModule,

    FlexLayoutModule,
    MatIconModule,

    FlPortalModule,
  ],
})
export class FlColorModule {
}
