import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FlChartLineSimpleComponent} from './component/fl-chart-line-simple/fl-chart-line-simple.component';
import {FlChartLineMultipleComponent} from './component/fl-chart-line-multiple/fl-chart-line-multiple.component';
import {FlChartCoreModule} from '../fl-chart-core/fl-chart-core.module';


@NgModule({
  declarations: [
    FlChartLineSimpleComponent,
    FlChartLineMultipleComponent,
  ],
  exports: [
    FlChartLineSimpleComponent,
    FlChartLineMultipleComponent,
  ],
  imports: [
    CommonModule,

    FlChartCoreModule,
  ],
})
export class FlChartLineModule {
}
