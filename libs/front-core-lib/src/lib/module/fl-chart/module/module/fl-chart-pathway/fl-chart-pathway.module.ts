import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FlChartCoreModule} from '../fl-chart-core/fl-chart-core.module';
import { FlChartPathwayComponent } from './fl-chart-pathway/fl-chart-pathway.component';

/**
 * Module to handle specific chart to show a pathway
 */
@NgModule({
  declarations: [FlChartPathwayComponent],
  exports: [FlChartPathwayComponent],
  imports: [
    CommonModule,

    FlChartCoreModule,
  ],
})
export class FlChartPathwayModule {
}
