import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FlChartLegendComponent} from './component/fl-chart-legend/fl-chart-legend.component';
import {FlexLayoutModule} from '@angular/flex-layout';
import {FlChartDataWithSeriePortalComponent} from './component/fl-chart-data-with-serie-portal/fl-chart-data-with-serie-portal.component';
import {FlTranslateModule} from '../../../../fl-translate/fl-translate.module';


/**
 * Core module for the chart, it shares common component and directives
 */
@NgModule({
  declarations: [
    FlChartLegendComponent,
    FlChartDataWithSeriePortalComponent
  ],
  exports: [
    FlChartLegendComponent,
    FlChartDataWithSeriePortalComponent
  ],
  imports: [
    CommonModule,

    FlexLayoutModule,
    FlTranslateModule,
  ],
})
export class FlChartCoreModule {
}
