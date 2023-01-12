import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FlDatePipe} from './pipe/fl-date/fl-date.pipe';
import {FlFromNowPipe} from './pipe/fl-from-now/fl-from-now.pipe';
import {FlDateRangeComponent} from './component/fl-date-range/fl-date-range.component';
import {FlTranslateModule} from '../fl-translate/fl-translate.module';
import {FlFromNowComponent} from './component/fl-from-now/fl-from-now.component';
import {MatLegacyTooltipModule as MatTooltipModule} from '@angular/material/legacy-tooltip';
import {FlCreationInfoComponent} from './component/fl-creation-info/fl-creation-info.component';
import {
  FlLastModificationInfoComponent
} from './component/fl-last-modification-info/fl-last-modification-info.component';
import {FlTranslateService} from '../fl-translate/service/fl-translate.service';
import {flDateI18n} from './i18n/fl-date.i18n';
import {FlDurationPipe} from './pipe/fl-duration/fl-duration.pipe';
import {FlLastSyncInfoComponent} from './component/fl-last-sync-info/fl-last-sync-info.component';

/**
 * Module regrouping component and pipe for dates
 */
@NgModule({
  declarations: [
    FlDateRangeComponent,
    FlDatePipe,
    FlFromNowPipe,
    FlFromNowComponent,
    FlCreationInfoComponent,
    FlLastModificationInfoComponent,
    FlDurationPipe,
    FlLastSyncInfoComponent,
  ],
  exports: [
    FlDateRangeComponent,
    FlDatePipe,
    FlFromNowPipe,
    FlFromNowComponent,
    FlCreationInfoComponent,
    FlLastModificationInfoComponent,
    FlDurationPipe,
    FlLastSyncInfoComponent,
  ],
  imports: [
    CommonModule,

    FlTranslateModule,

    MatTooltipModule,
  ]
})
export class FlDateModule {
  constructor(translateService: FlTranslateService) {
    translateService.addModuleTranslation('FlDateModule', flDateI18n);
  }

}
