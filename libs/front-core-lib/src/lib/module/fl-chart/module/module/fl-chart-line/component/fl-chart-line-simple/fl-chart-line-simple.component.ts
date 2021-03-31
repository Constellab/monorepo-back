import {Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {Numeric} from 'd3';
import {FlChartAxisScaleDate, FlChartAxisScaleLinear, FlChartAxisScaleNumber} from '../../../../../model/fl-chart-scale.class';
import {FlChart2dDataContainer, FlChart2dDataContainerLinear} from '../../../../../model/fl-chart-2d-data.class';
import {FlChart2dBrush, FlChartBrush} from '../../../../../model/fl-chart-2d-brush.class';
import {FlChart2dHoverLine} from '../../../../../model/fl-chart-2d-hover.class';
import {getSingleSerieData, SingleSerieData} from '../../../../../model/data';
import {FlChartSvg} from '../../../../../model/fl-chart-svg.class';
import {FlChartRendererLine} from '../../model/fl-chart-renderer-line.class';
import {FlChartContainer2d} from '../../../../../model/fl-chart-container.class';

@Component({
  selector: 'fl-chart-line-simple',
  templateUrl: './fl-chart-line-simple.component.html',
  styleUrls: ['./fl-chart-line-simple.component.scss']
})
export class FlChartLineSimpleComponent implements OnInit {

  @ViewChild('chart', {static: true}) chartHtmlContainer: ElementRef<HTMLElement>;

  chart: FlChartContainer2d<FlChart2dDataContainerLinear<SingleSerieData>>;

  data: FlChart2dDataContainerLinear<SingleSerieData>;

  brush: FlChartBrush;

  constructor() {
  }

  ngOnInit(): void {
    const data: SingleSerieData[] = getSingleSerieData();
    this.initChart(data);
    this.initBrush();
    this.initHover();
  }


  private initChart(data: SingleSerieData[]): void {
    this.data = new FlChart2dDataContainer(data);

    const svg: FlChartSvg = new FlChartSvg(460, 400).initSvg(this.chartHtmlContainer.nativeElement);
    const chart: FlChartContainer2d<FlChart2dDataContainerLinear<SingleSerieData>> = new FlChartContainer2d(svg.svg, svg.width, svg.height);


    const xScale: FlChartAxisScaleLinear<Numeric> = new FlChartAxisScaleDate()
      .domain(this.data.getDomainX())
      .range(chart.getRangeX());

    const yScale: FlChartAxisScaleLinear<Numeric> = new FlChartAxisScaleNumber()
      .domain(this.data.getDomainY())
      .range(chart.getRangeY());

    chart.initX(xScale)
      .initY(yScale)
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
