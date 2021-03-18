import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FlChartLineSimpleComponent } from './component/fl-chart-line-simple/fl-chart-line-simple.component';
import { FlChartLineMultipleComponent } from './component/fl-chart-line-multiple/fl-chart-line-multiple.component';



@NgModule({
  declarations: [FlChartLineSimpleComponent, FlChartLineMultipleComponent],
  imports: [
    CommonModule
  ],
  exports: [FlChartLineSimpleComponent, FlChartLineMultipleComponent]
})
export class FlChartLineModule { }
