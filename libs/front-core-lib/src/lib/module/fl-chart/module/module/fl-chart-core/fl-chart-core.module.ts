import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FlChartLegendComponent} from './component/fl-chart-legend/fl-chart-legend.component';
import {FlexLayoutModule} from '@angular/flex-layout';
import {FlChartDataWithSeriePortalComponent} from './component/fl-chart-data-with-serie-portal/fl-chart-data-with-serie-portal.component';
import {FlTranslateModule} from '../../../../fl-translate/fl-translate.module';
import {FlChartBoxPlotDataPortalComponent} from './component/fl-chart-box-plot-data-portal/fl-chart-box-plot-data-portal.component';
import {FlChartSerieInlineComponent} from './component/fl-chart-serie-inline/fl-chart-serie-inline.component';
import {FlChartScalePipe} from './pipe/fl-chart-scale.pipe';
import {FlChartBinDataPortalComponent} from './component/fl-chart-bin-data-portal/fl-chart-bin-data-portal.component';


/**
 * Core module for the chart, it shares common component and directives
 */
@NgModule({
  declarations: [
    FlChartLegendComponent,
    FlChartDataWithSeriePortalComponent,
    FlChartBoxPlotDataPortalComponent,
    FlChartSerieInlineComponent,
    FlChartScalePipe,
    FlChartBinDataPortalComponent
  ],
  exports: [
    FlChartLegendComponent,
    FlChartDataWithSeriePortalComponent,
    FlChartBoxPlotDataPortalComponent,
    FlChartScalePipe,
    FlChartBinDataPortalComponent
  ],
  imports: [
    CommonModule,

    FlexLayoutModule,
    FlTranslateModule,
  ],
  entryComponents: [FlChartSerieInlineComponent],
})
export class FlChartCoreModule {
}
