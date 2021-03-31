import {NgModule} from '@angular/core';
import {FlChartLineModule} from './module/module/fl-chart-line/fl-chart-line.module';
import {FlChartHistogramModule} from './module/module/fl-chart-histogram/fl-chart-histogram.module';
import {FlChartPieModule} from './module/module/fl-chart-pie/fl-chart-pie.module';
import {FlChartScatterPlotModule} from './module/module/fl-chart-scatter-plot/fl-chart-scatter-plot.module';
import {FlChartCoreModule} from './module/module/fl-chart-core/fl-chart-core.module';
import {FlChartDynamicComponent} from './component/fl-chart-dynamic/fl-chart-dynamic.component';
import { FlChartDynamicPortalComponent } from './component/fl-chart-dynamic-portal/fl-chart-dynamic-portal.component';
import {DragDropModule} from '@angular/cdk/drag-drop';
import {FlChartPortalService} from './service/fl-chart-portal.service';
import {FlPortalModule} from '../fl-portal/fl-portal.module';
import {MatButtonModule} from '@angular/material/button';
import {MatIconModule} from '@angular/material/icon';
import {FlexLayoutModule} from '@angular/flex-layout';

/**
 * Main module exporting all the chart modules
 */
@NgModule({
  exports: [
    // Component
    FlChartDynamicComponent,

    FlChartCoreModule,
    FlChartHistogramModule,
    FlChartLineModule,
    FlChartPieModule,
    FlChartScatterPlotModule,
    FlChartDynamicComponent,
    FlChartDynamicPortalComponent,
  ],
  declarations: [
    FlChartDynamicComponent,
    FlChartDynamicPortalComponent
  ],
  imports: [
    FlPortalModule,

    DragDropModule,
    MatButtonModule,
    MatIconModule,
    FlexLayoutModule,
  ],
  providers: [
    FlChartPortalService
  ]
})
export class FlChartModule {
}
