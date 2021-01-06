import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {ReportCardComponent} from './component/report-card/report-card.component';
import {CoreModule} from '../../../core/core.module';

/**
 * Core module for Report entity
 */
@NgModule({
  declarations: [ReportCardComponent],
  exports: [
    ReportCardComponent
  ],
  imports: [
    CommonModule,

    CoreModule,
  ]
})
export class ReportCoreModule {
}
