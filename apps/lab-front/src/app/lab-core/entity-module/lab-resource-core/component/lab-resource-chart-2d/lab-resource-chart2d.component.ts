import {Component, OnInit} from '@angular/core';
import {LabResourceViewDirective} from '../../model/lab-resource-view.directive';
import {FlChartConfig} from '@monorepo/front-core-lib';
import {labBasicPlotToChart} from '../../../../model/entities/resource/lab-resource-view-basic-plot-2d.class';
import {labBoxPlotToChart} from '../../../../model/entities/resource/lab-resource-view-box-plot.class';
import {labHeatMapToChart} from '../../../../model/entities/resource/lab-resource-view-heat-map.class';
import {labHistogramToChart} from '../../../../model/entities/resource/lab-resource-view-histogram.class';
import {labVennDiagramToChart} from '../../../../model/entities/resource/lab-resource-venn-diagram.class';

/**
 * Resource view component to show 2d charts (Line plot, Scatter plot, heatmap, venn diagram...)
 */
@Component({
  selector: 'lab-resource-chart-2d',
  templateUrl: './lab-resource-chart2d.component.html',
  styleUrls: ['./lab-resource-chart2d.component.scss']
})
export class LabResourceChart2dComponent
  extends LabResourceViewDirective implements OnInit {

  chart: FlChartConfig;


  ngOnInit(): void {
    this.convertToChartData();
  }

  private convertToChartData(): void {
    switch (this.view.type) {
      case 'scatter-plot-2d-view':
      case 'line-plot-2d-view':
      case 'bar-plot-view':
      case 'stacked-bar-plot-view':
        this.chart = labBasicPlotToChart(this.view);
        break;
      case 'box-plot-view':
        this.chart = labBoxPlotToChart(this.view);
        break;
      case 'heatmap-view':
        this.chart = labHeatMapToChart(this.view);
        break;
      case 'histogram-view':
        this.chart = labHistogramToChart(this.view);
        break;
      case 'venn-diagram-view':
        this.chart = labVennDiagramToChart(this.view);
        break;
      default:
        console.error(`[BioxResourceChart2dComponent] view type ${this.view.type} not supported`);
    }
  }

}
