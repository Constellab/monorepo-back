import {NgModule} from '@angular/core';
import {FlChartLineModule} from './module/fl-chart-line/fl-chart-line.module';

/**
 * Main module exporting all the chart modules
 */
@NgModule({
  exports: [
    FlChartLineModule
  ]
})
export class FlChartModule {
}
