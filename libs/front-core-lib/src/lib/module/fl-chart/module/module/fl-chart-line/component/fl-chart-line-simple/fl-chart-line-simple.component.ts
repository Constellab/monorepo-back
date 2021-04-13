import {Component, ElementRef, Input, OnInit, ViewChild} from '@angular/core';
import {Numeric} from 'd3';
import {FlChartAxisScaleDate, FlChartAxisScaleLinear, FlChartAxisScaleNumber} from '../../../../../model/fl-chart-scale.class';
import {FlChart2dDataContainerLinearI} from '../../../../../model/fl-chart-2d-data.class';
import {FlChart2dBrush, FlChartBrush} from '../../../../../model/fl-chart-2d-brush.class';
import {FlChart2dHoverLine} from '../../../../../model/fl-chart-2d-hover.class';
import {SingleSerieData} from '../../../../../model/data';
import {FlChartSvg} from '../../../../../model/fl-chart-svg.class';
import {FlChartRendererLine} from '../../model/fl-chart-renderer-line.class';
import {FlChartContainer2d} from '../../../../../model/fl-chart-container.class';
import {FlChartAxis} from '../../../../../model/fl-chart-axis.class';

@Component({
  selector: 'fl-chart-line-simple',
  templateUrl: './fl-chart-line-simple.component.html',
  styleUrls: ['./fl-chart-line-simple.component.scss']
})
export class FlChartLineSimpleComponent implements OnInit {

  @ViewChild('chart', {static: true}) chartHtmlContainer: ElementRef<HTMLElement>;

  @Input() data: FlChart2dDataContainerLinearI<SingleSerieData>;

  chart: FlChartContainer2d<FlChart2dDataContainerLinearI<SingleSerieData>>;

  brush: FlChartBrush;

  constructor() {
  }

  ngOnInit(): void {
    this.initChart();
    this.initBrush();
    this.initHover();
  }


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


    chart.initXAxis(xAxis)
      .initAxisY(yAxis)
      .addRenderer(new FlChartRendererLine())
      .initData(this.data);

    this.chart = chart;
  }

  private initBrush(): void {
    this.brush = new FlChart2dBrush(this.chart);
  }

  private initHover(): void {
    new FlChart2dHoverLine(this.chart);
  }
}
