import {Component, ElementRef, Input, OnInit, ViewChild} from '@angular/core';
import {MultiSerieData} from '../../../../../model/data';
import {FlChartAxisScaleLinear, FlChartAxisScaleNumber} from '../../../../../model/fl-chart-scale.class';
import {Numeric} from 'd3';
import {FlChart2dBrush, FlChartBrush} from '../../../../../model/fl-chart-2d-brush.class';
import {FlChart2dHoverLine} from '../../../../../model/fl-chart-2d-hover.class';
import {FlChartSvg} from '../../../../../model/fl-chart-svg.class';
import {FlChartContainer2d} from '../../../../../model/fl-chart-container.class';
import {FlChartRendererLineMulti} from '../../model/fl-chart-renderer-line-multi.class';
import {FlChartComponent} from '../../../../../model/fl-chart-component.class';
import {FlChartAxis} from '../../../../../model/fl-chart-axis.class';
import {FlChart2dMultipleSerie} from '../../../../../model/fl-chart-2d-serie.class';


@Component({
  selector: 'fl-chart-line-multiple',
  templateUrl: './fl-chart-line-multiple.component.html',
  styleUrls: ['./fl-chart-line-multiple.component.scss']
})
export class FlChartLineMultipleComponent implements OnInit, FlChartComponent {

  @ViewChild('chart', {static: true}) chartHtmlContainer: ElementRef<HTMLElement>;

  @Input() data: FlChart2dMultipleSerie<MultiSerieData>;

  chart: FlChartContainer2d<FlChart2dMultipleSerie<MultiSerieData>>;


  renderer: FlChartRendererLineMulti;

  brush: FlChartBrush;

  constructor() {
  }

  ngOnInit(): void {
    this.initChart();
    this.initBrush();
    // this.initHover();
  }


  private initChart(): void {

    const svg: FlChartSvg = new FlChartSvg(460, 400).initSvg(this.chartHtmlContainer.nativeElement);
    const chart: FlChartContainer2d<FlChart2dMultipleSerie<MultiSerieData>> = new FlChartContainer2d(svg.svg, svg.width, svg.height);

    const xScale: FlChartAxisScaleLinear<Numeric> = new FlChartAxisScaleNumber()
      .domain(this.data.getDomainX())
      .range(chart.getRangeX());
    const xAxis: FlChartAxis = new FlChartAxis('bottom').setScale(xScale)
      .setTickFormat(this.data.axisXFormat);


    const yScale: FlChartAxisScaleLinear<Numeric> = new FlChartAxisScaleNumber()
      .domain(this.data.getDomainY())
      .range(chart.getRangeY());
    const yAxis: FlChartAxis = new FlChartAxis('left').setScale(yScale);


    this.renderer = new FlChartRendererLineMulti();

    chart
      .initXAxis(xAxis)
      .initAxisY(yAxis)
      .addRenderer(this.renderer)
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
