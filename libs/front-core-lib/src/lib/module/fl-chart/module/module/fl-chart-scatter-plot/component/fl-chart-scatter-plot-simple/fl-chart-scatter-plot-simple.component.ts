import {Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {getSingleSerieData, SingleSerieData} from '../../../../../model/data';
import {FlChart2dDataContainer, FlChart2dDataContainerLinear} from '../../../../../model/fl-chart-2d-data.class';
import {FlChartAxisScaleDate, FlChartAxisScaleLinear, FlChartAxisScaleNumber} from '../../../../../model/fl-chart-scale.class';
import {Numeric} from 'd3';
import {FlChartRendererScatterPlot} from '../../model/fl-chart-renderer-scatter-plot.class';
import {FlChart2dBrush} from '../../../../../model/fl-chart-2d-brush.class';
import {FlChartContainer2d} from '../../../../../model/fl-chart-container.class';
import {FlChartSvg} from '../../../../../model/fl-chart-svg.class';

@Component({
  selector: 'fl-chart-scatter-plot-simple',
  templateUrl: './fl-chart-scatter-plot-simple.component.html',
  styleUrls: ['./fl-chart-scatter-plot-simple.component.scss']
})
export class FlChartScatterPlotSimpleComponent implements OnInit {


  @ViewChild('chart', {static: true}) chartHtmlContainer: ElementRef<HTMLElement>;

  chart: FlChartContainer2d<FlChart2dDataContainerLinear<SingleSerieData>>;


  constructor() {
  }

  ngOnInit(): void {
    const data: SingleSerieData[] = getSingleSerieData();
    this.initChart(data);
    this.initBrush();
  }


  // todo est exactement pareil que le line simple sauf le renderer
  private initChart(data: SingleSerieData[]): void {
    const dataContainer: FlChart2dDataContainerLinear<SingleSerieData> = new FlChart2dDataContainer(data);

    const svg: FlChartSvg = new FlChartSvg(460, 400).initSvg(this.chartHtmlContainer.nativeElement);
    const chart: FlChartContainer2d<FlChart2dDataContainerLinear<SingleSerieData>> = new FlChartContainer2d(svg.svg, svg.width, svg.height);

    const xScale: FlChartAxisScaleLinear<Numeric> = new FlChartAxisScaleDate()
      .domain(dataContainer.getDomainX())
      .range(chart.getRangeX());

    const yScale: FlChartAxisScaleLinear<Numeric> = new FlChartAxisScaleNumber()
      .domain(dataContainer.getDomainY())
      .range(chart.getRangeY());

    chart
      .initX(xScale)
      .initY(yScale)
      .addRenderer(new FlChartRendererScatterPlot())
      .initData(dataContainer);

    this.chart = chart;
  }

  private initBrush(): void {
    new FlChart2dBrush(this.chart);
  }

}
