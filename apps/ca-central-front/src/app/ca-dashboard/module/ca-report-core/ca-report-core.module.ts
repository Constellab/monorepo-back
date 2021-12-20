import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {CaReportCardComponent} from './component/ca-report-card/ca-report-card.component';
import {CaCoreModule} from '../../../ca-core/ca-core.module';

/**
 * Core module for Report entity
 */
@NgModule({
  declarations: [CaReportCardComponent],
  exports: [
    CaReportCardComponent
  ],
  imports: [
    CommonModule,

    CaCoreModule,
  ]
})
export class CaReportCoreModule {
}
