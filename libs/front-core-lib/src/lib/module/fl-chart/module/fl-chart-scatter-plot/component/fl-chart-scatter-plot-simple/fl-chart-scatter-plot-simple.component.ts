import {Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {FlChart2d} from '../../../../model/fl-chart-2d.class';
import {getSingleSerieData, SingleSerieData} from '../../../../model/data';
import {FlChart2dData, FlChart2dDataContainer} from '../../../../model/fl-chart-2d-data.class';
import {FlChartAxisScale, FlChartAxisScaleDate, FlChartAxisScaleNumber} from '../../../../model/fl-chart-scale.class';
import {Numeric} from 'd3';
import {FlChart2dScatterPlot} from '../../model/fl-chart-2d-scatter-plot.class';
import {FlChart2dBrush} from '../../../../model/fl-chart-2d-brush.class';

@Component({
  selector: 'fl-chart-scatter-plot-simple',
  templateUrl: './fl-chart-scatter-plot-simple.component.html',
  styleUrls: ['./fl-chart-scatter-plot-simple.component.scss']
})
export class FlChartScatterPlotSimpleComponent implements OnInit {


  @ViewChild('chart', {static: true}) chartHtmlContainer: ElementRef<HTMLElement>;

  chart: FlChart2d<SingleSerieData>;


  constructor() {
  }

  ngOnInit(): void {
    const data: SingleSerieData[] = getSingleSerieData();
    this.initChart(data);
    this.initBrush();
  }


  private initChart(data: SingleSerieData[]): void {
    const dataContainer: FlChart2dDataContainer<SingleSerieData> = new FlChart2dData(data);

    const chart: FlChart2d<SingleSerieData> = new FlChart2dScatterPlot<SingleSerieData>(460, 400);

    const xScale: FlChartAxisScale<Numeric> = new FlChartAxisScaleDate()
      .domain(dataContainer.getExtentX())
      .range(chart.getRangeX());

    const yScale: FlChartAxisScale<Numeric> = new FlChartAxisScaleNumber()
      .domain(dataContainer.getExtentY())
      .range(chart.getRangeY());

    chart.initSvg(this.chartHtmlContainer.nativeElement)
      .initX(xScale)
      .initY(yScale)
      .initData(dataContainer);

    this.chart = chart;
  }

  private initBrush(): void {
    new FlChart2dBrush(this.chart);
  }

}
