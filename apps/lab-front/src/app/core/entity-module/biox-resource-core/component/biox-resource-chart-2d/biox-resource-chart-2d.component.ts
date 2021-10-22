import {Component, OnInit} from '@angular/core';
import {BioxResourceViewDirective} from '../../model/biox-resource-view-component.class';
import {BioxResourceViewLinePlot2d, BioxResourceViewScatterPlot2d} from '../../../../model/entities/resource/biox-resource-view.entity';
import {FlChart2dDatum, FlChart2dDatumNumber, FlChart2dMultiSerie, FlChartSerie, FlChartType} from '@monorepo/front-core-lib';

/**
 * Resource view component to show 2d charts (Line plot, Scatter plot)
 */
@Component({
  selector: 'gen-biox-resource-chart-2d',
  templateUrl: './biox-resource-chart-2d.component.html',
  styleUrls: ['./biox-resource-chart-2d.component.scss']
})
export class BioxResourceChart2dComponent
  extends BioxResourceViewDirective<BioxResourceViewScatterPlot2d | BioxResourceViewLinePlot2d> implements OnInit {

  series: FlChart2dMultiSerie<FlChart2dDatum>;
  chartType: FlChartType;


  ngOnInit(): void {
    this.convertToChartData();
    this.setChartType();
  }

  private convertToChartData(): void {
    const series: FlChart2dMultiSerie<FlChart2dDatum> = new FlChart2dMultiSerie();

    for (const viewSerie of this.view.data) {
      const data: FlChart2dDatum[] = [];

      for (let i = 0; i < viewSerie.data.x.length; i++) {
        data.push(new FlChart2dDatumNumber(viewSerie.data.x[i], viewSerie.data.y[i]));
      }

      series.addSerie(new FlChartSerie(data, viewSerie.y_label));
    }


    this.series = series;
    console.log(series);
  }

  private setChartType(): void {
    switch (this.view.type) {
      case 'scatter-plot-2d-view':
        this.chartType = FlChartType.SCATTER_PLOT;
        break;
      case 'line-plot-2d-view':
        this.chartType = FlChartType.LINE;
        break;
    }
  }

}
