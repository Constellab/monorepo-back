import {Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {getMultiSerieData, MultiSerieData} from '../../../../../model/data';
import {FlChartAxisScaleLinear, FlChartAxisScaleNumber} from '../../../../../model/fl-chart-scale.class';
import {Numeric} from 'd3';
import {FlChart2dBrush} from '../../../../../model/fl-chart-2d-brush.class';
import {FlChartScatterPlotRendererMulti} from '../../model/fl-chart-scatter-plot-renderer-multi.class';
import {FlChartSvg} from '../../../../../model/fl-chart-svg.class';
import {FlChartContainer2d} from '../../../../../model/fl-chart-container.class';
import {FlChartAxis} from '../../../../../model/fl-chart-axis.class';
import {FlChart2dMultipleSerie} from '../../../../../model/fl-chart-2d-serie.class';

@Component({
  selector: 'fl-chart-scatter-plot-multiple',
  templateUrl: './fl-chart-scatter-plot-multiple.component.html',
  styleUrls: ['./fl-chart-scatter-plot-multiple.component.scss']
})
export class FlChartScatterPlotMultipleComponent implements OnInit {

  @ViewChild('chart', {static: true}) chartHtmlContainer: ElementRef<HTMLElement>;

  series: FlChart2dMultipleSerie<MultiSerieData>;

  chart: FlChartContainer2d<FlChart2dMultipleSerie<MultiSerieData>>;


  constructor() {
  }

  ngOnInit(): void {
    this.series = new FlChart2dMultipleSerie<MultiSerieData>(getMultiSerieData());

    this.initChart();
    this.initBrush();
  }


  private initChart(): void {

    const svg: FlChartSvg = new FlChartSvg(460, 400).initSvg(this.chartHtmlContainer.nativeElement);
    const chart: FlChartContainer2d<FlChart2dMultipleSerie<MultiSerieData>> = new FlChartContainer2d(svg.svg, svg.width, svg.height);

    const xScale: FlChartAxisScaleLinear<Numeric> = new FlChartAxisScaleNumber()
      .domain(this.series.getDomainX())
      .range(chart.getRangeX());
    const xAxis: FlChartAxis = new FlChartAxis('bottom').setScale(xScale);


    const yScale: FlChartAxisScaleLinear<Numeric> = new FlChartAxisScaleNumber()
      .domain(this.series.getDomainY())
      .range(chart.getRangeY());
    const yAxis: FlChartAxis = new FlChartAxis('left').setScale(yScale);

    chart
      .initXAxis(xAxis)
      .initAxisY(yAxis)
      .addRenderer(new FlChartScatterPlotRendererMulti())
      .initData(this.series);

    this.chart = chart;
  }

  private initBrush(): void {
    new FlChart2dBrush(this.chart);
  }

}
