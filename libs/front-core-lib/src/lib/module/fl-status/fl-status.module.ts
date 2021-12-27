import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FlStatusChipComponent} from './component/fl-status-chip/fl-status-chip.component';
import {MatIconModule} from '@angular/material/icon';
import {FlCoreComponentModule} from '../fl-core-component/fl-core-component.module';
import {FlIconModule} from '../fl-svg-icon/fl-icon.module';
import {FlTextIconModule} from '../fl-text-icon/fl-text-icon.module';
import {FlTranslateModule} from '../fl-translate/fl-translate.module';
import {MatTooltipModule} from '@angular/material/tooltip';
import {FlTranslateService} from '../fl-translate/service/fl-translate.service';
import {flStatusI18n} from './i18n/fl-status.i18n';

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
    FlIconModule,
    FlTextIconModule,
    FlTranslateModule,

    MatIconModule,
    MatTooltipModule,

  ]
})
export class FlStatusModule {
  constructor(translateService: FlTranslateService) {
    translateService.addModuleTranslation('FlStatusModule', flStatusI18n);
  }
}
