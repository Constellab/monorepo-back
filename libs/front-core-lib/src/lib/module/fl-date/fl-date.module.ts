import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FlDatePipe} from './pipe/fl-date/fl-date.pipe';
import {FlFromNowPipe} from './pipe/fl-from-now/fl-from-now.pipe';
import {FlDateRangeComponent} from './component/fl-date-range/fl-date-range.component';
import {FlTranslateModule} from '../fl-translate/fl-translate.module';
import { FlFromNowComponent } from './component/fl-from-now/fl-from-now.component';
import {MatTooltipModule} from '@angular/material/tooltip';

/**
 * Module regrouping component and pipe for dates
 */
@NgModule({
  declarations: [
    FlDateRangeComponent,
    FlDatePipe,
    FlFromNowPipe,
    FlFromNowComponent,
  ],
  exports: [
    FlDateRangeComponent,
    FlDatePipe,
    FlFromNowPipe,
    FlFromNowComponent,
  ],
  imports: [
    CommonModule,

    FlTranslateModule,

    MatTooltipModule,
  ]
})
export class FlDateModule {
}
