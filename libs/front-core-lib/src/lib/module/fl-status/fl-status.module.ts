import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FlStatusChipComponent} from './component/fl-status-chip/fl-status-chip.component';
import {MatIconModule} from '@angular/material/icon';
import {FlCoreComponentModule} from '../fl-core-component/fl-core-component.module';
import {FlSvgIconModule} from '../fl-svg-icon/fl-svg-icon.module';
import {FlTextIconModule} from '../fl-text-icon/fl-text-icon.module';
import {FlTranslateModule} from '../fl-translate/fl-translate.module';

@NgModule({
  declarations: [
    FlStatusChipComponent,
  ],
  exports: [
    FlStatusChipComponent
  ],
  imports: [
    CommonModule,

    FlCoreComponentModule,
    FlSvgIconModule,
    FlTextIconModule,
    FlTranslateModule,

    MatIconModule,

  ]
})
export class FlStatusModule {
}
