import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FlChartPieComponent } from './component/fl-chart-pie/fl-chart-pie.component';


// todo faire les graphiques
@NgModule({
  declarations: [FlChartPieComponent],
  imports: [
    CommonModule
  ],
  exports: [FlChartPieComponent]
})
export class FlChartPieModule { }
