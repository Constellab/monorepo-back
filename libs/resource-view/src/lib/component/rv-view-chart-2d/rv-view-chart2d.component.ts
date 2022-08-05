import {Component, OnInit} from '@angular/core';
import {FlChartConfig} from '@monorepo/front-core-lib';
import {RvResourceViewDirective} from '../../model/rv-resource-view.directive';
import {rvBasicPlotToChart} from '../../model/rv-basic-plot-2d.class';
import {rvBoxPlotToChart} from '../../model/rv-box-plot.class';
import {rvHeatMapToChart} from '../../model/rv-heat-map.class';
import {rvHistogramToChart} from '../../model/rv-histogram.class';
import {rvVennDiagramToChart} from '../../model/rv-venn-diagram.class';
import {RvViewChartType} from '../../model/rv-resource-view.class';
import {rvVulcanoPlotToChart} from '../../model/rv-vulcano-plot.class';

/**
 * Resource view component to show 2d charts (Line plot, Scatter plot, heatmap, venn diagram...)
 */
@Component({
  selector: 'rv-view-chart-2d',
  templateUrl: './rv-view-chart2d.component.html',
  styleUrls: ['./rv-view-chart2d.component.scss']
})
export class RvViewChart2dComponent
  extends RvResourceViewDirective<RvViewChartType> implements OnInit {

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
        this.chart = rvBasicPlotToChart(this.view);
        break;
      case 'box-plot-view':
        this.chart = rvBoxPlotToChart(this.view);
        break;
      case 'heatmap-view':
        this.chart = rvHeatMapToChart(this.view);
        break;
      case 'histogram-view':
        this.chart = rvHistogramToChart(this.view);
        break;
      case 'venn-diagram-view':
        this.chart = rvVennDiagramToChart(this.view);
        break;
      case 'vulcano-plot-view':
        this.chart = rvVulcanoPlotToChart(this.view);
        break;
      default:
        console.error(`[BioxResourceChart2dComponent] view type ${(this.view as any).type} not supported`);
    }
  }

}
