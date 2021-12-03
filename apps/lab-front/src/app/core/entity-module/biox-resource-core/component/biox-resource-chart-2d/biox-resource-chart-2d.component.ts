import {Component, OnInit} from '@angular/core';
import {BioxResourceViewDirective} from '../../model/biox-resource-view-component.class';
import {FlChartConfig} from '@monorepo/front-core-lib';
import {bioxBasicPlotToChart} from '../../../../model/entities/resource/biox-resource-view-basic-plot-2d.class';
import {bioxBoxPlotToChart} from '../../../../model/entities/resource/biox-resource-view-box-plot.class';
import {bioxHeatMapToChart} from '../../../../model/entities/resource/biox-resource-view-heat-map.class';
import {bioxHistogramToChart} from '../../../../model/entities/resource/biox-resource-view-histogram.class';
import {bioxVennDiagramToChart} from '../../../../model/entities/resource/biox-resource-venn-diagram.class';

/**
 * Resource view component to show 2d charts (Line plot, Scatter plot, heatmap, venn diagram...)
 */
@Component({
  selector: 'gen-biox-resource-chart-2d',
  templateUrl: './biox-resource-chart-2d.component.html',
  styleUrls: ['./biox-resource-chart-2d.component.scss']
})
export class BioxResourceChart2dComponent
  extends BioxResourceViewDirective implements OnInit {

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
        this.chart = bioxBasicPlotToChart(this.view);
        break;
      case 'box-plot-view':
        this.chart = bioxBoxPlotToChart(this.view);
        break;
      case 'heatmap-view':
        this.chart = bioxHeatMapToChart(this.view);
        break;
      case 'histogram-view':
        this.chart = bioxHistogramToChart(this.view);
        break;
      case 'venn-diagram-view':
        this.chart = bioxVennDiagramToChart(this.view);
        break;
      default:
        console.error(`[BioxResourceChart2dComponent] view type ${this.view.type} not supported`);
    }
  }

}
