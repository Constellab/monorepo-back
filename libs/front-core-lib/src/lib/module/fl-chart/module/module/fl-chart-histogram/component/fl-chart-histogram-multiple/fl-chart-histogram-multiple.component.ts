import {Component, ElementRef, Input, OnInit, ViewChild} from '@angular/core';
import {FlChartComponent} from '../../../../../model/fl-chart-component.class';
import {FlChart2dMultipleSerie} from '../../../../../model/fl-chart-2d-serie.class';
import {MultiSerieData} from '../../../../../model/data';
import {FlChartContainer2d} from '../../../../../model/fl-chart-container.class';
import {FlChart2dBrushX, FlChartBrush} from '../../../../../model/fl-chart-2d-brush.class';
import {FlChartSvg} from '../../../../../model/fl-chart-svg.class';
import {
  FlChartAxisScale,
  FlChartAxisScaleBand,
  FlChartAxisScaleLinear,
  FlChartAxisScaleNumber
} from '../../../../../model/fl-chart-scale.class';
import {Numeric} from 'd3';
import {FlChartAxis} from '../../../../../model/fl-chart-axis.class';
import {FlChartHistogramMultiRenderer} from '../../model/fl-chart-histogram-multi-renderer.class';

@Component({
  selector: 'fl-chart-histogram-multiple',
  templateUrl: './fl-chart-histogram-multiple.component.html',
  styleUrls: ['./fl-chart-histogram-multiple.component.scss']
})
export class FlChartHistogramMultipleComponent implements OnInit, FlChartComponent {

  @ViewChild('chart', {static: true}) chartHtmlContainer: ElementRef<HTMLElement>;

  @Input() data: FlChart2dMultipleSerie<MultiSerieData>;

  chart: FlChartContainer2d<FlChart2dMultipleSerie<MultiSerieData>>;

  renderer: FlChartHistogramMultiRenderer;

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

    const xScale: FlChartAxisScale<Numeric> = new FlChartAxisScaleBand()
      .domain(this.data.getDomainX())
      .range(chart.getRangeX());

    const xAxis: FlChartAxis = new FlChartAxis('bottom').setScale(xScale)
      .setTickFormat(this.data.axisXFormat);


    const yScale: FlChartAxisScaleLinear<Numeric> = new FlChartAxisScaleNumber()
      .domain([0, this.data.getDomainY()[1]])
      .range(chart.getRangeY());
    const yAxis: FlChartAxis = new FlChartAxis('left').setScale(yScale);

    this.renderer = new FlChartHistogramMultiRenderer();

    chart
      .initXAxis(xAxis)
      .initAxisY(yAxis)
      .addRenderer(this.renderer)
      .initData(this.data);

    this.chart = chart;
  }

  private initBrush(): void {
    this.brush = new FlChart2dBrushX(this.chart);
  }

}
