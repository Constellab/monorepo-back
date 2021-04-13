import {Component, ElementRef, Input, OnInit, ViewChild} from '@angular/core';
import {SingleSerieData} from '../../../../../model/data';
import {FlChart2dDataContainerLinearI} from '../../../../../model/fl-chart-2d-data.class';
import {FlChartAxisScaleDate, FlChartAxisScaleLinear, FlChartAxisScaleNumber} from '../../../../../model/fl-chart-scale.class';
import {Numeric} from 'd3';
import {FlChartRendererScatterPlot} from '../../model/fl-chart-renderer-scatter-plot.class';
import {FlChart2dBrush} from '../../../../../model/fl-chart-2d-brush.class';
import {FlChartContainer2d} from '../../../../../model/fl-chart-container.class';
import {FlChartSvg} from '../../../../../model/fl-chart-svg.class';
import {FlChartAxis} from '../../../../../model/fl-chart-axis.class';

@Component({
  selector: 'fl-chart-scatter-plot-simple',
  templateUrl: './fl-chart-scatter-plot-simple.component.html',
  styleUrls: ['./fl-chart-scatter-plot-simple.component.scss']
})
export class FlChartScatterPlotSimpleComponent implements OnInit {

  @ViewChild('chart', {static: true}) chartHtmlContainer: ElementRef<HTMLElement>;

  @Input() data: FlChart2dDataContainerLinearI<SingleSerieData>;

  chart: FlChartContainer2d<FlChart2dDataContainerLinearI<SingleSerieData>>;


  constructor() {
  }

  ngOnInit(): void {
    this.initChart();
    this.initBrush();
  }


  // todo est exactement pareil que le line simple sauf le renderer
  private initChart(): void {

    const svg: FlChartSvg = new FlChartSvg(460, 400).initSvg(this.chartHtmlContainer.nativeElement);
    const chart: FlChartContainer2d<FlChart2dDataContainerLinearI<SingleSerieData>>
      = new FlChartContainer2d(svg.svg, svg.width, svg.height);

    const xScale: FlChartAxisScaleLinear<Numeric> = new FlChartAxisScaleDate()
      .domain(this.data.getDomainX())
      .range(chart.getRangeX());
    const xAxis: FlChartAxis = new FlChartAxis('bottom').setScale(xScale);

    const yScale: FlChartAxisScaleLinear<Numeric> = new FlChartAxisScaleNumber()
      .domain(this.data.getDomainY())
      .range(chart.getRangeY());
    const yAxis: FlChartAxis = new FlChartAxis('left').setScale(yScale);

    chart
      .initXAxis(xAxis)
      .initAxisY(yAxis)
      .addRenderer(new FlChartRendererScatterPlot())
      .initData(this.data);

    this.chart = chart;
  }

  private initBrush(): void {
    new FlChart2dBrush(this.chart);
  }

}
