import {Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {FlChart2dMultipleSerie} from '../../../../model/fl-chart-2d-data.class';
import {getMultiSerieData, MultiSerieData} from '../../../../model/data';
import {FlChartAxisScaleLinear, FlChartAxisScaleNumber} from '../../../../model/fl-chart-scale.class';
import {Numeric} from 'd3';
import {FlChart2dBrush, FlChartBrush} from '../../../../model/fl-chart-2d-brush.class';
import {FlChart2dHoverLine} from '../../../../model/fl-chart-2d-hover.class';
import {FlChartSvg} from '../../../../model/fl-chart-svg.class';
import {FlChartContainer2d} from '../../../../model/fl-chart-container.class';
import {FlChartRendererLineMulti} from '../../model/fl-chart-renderer-line-multi.class';


@Component({
  selector: 'fl-chart-line-multiple',
  templateUrl: './fl-chart-line-multiple.component.html',
  styleUrls: ['./fl-chart-line-multiple.component.scss']
})
export class FlChartLineMultipleComponent implements OnInit {

  @ViewChild('chart', {static: true}) chartHtmlContainer: ElementRef<HTMLElement>;

  chart: FlChartContainer2d<FlChart2dMultipleSerie<MultiSerieData>>;

  series: FlChart2dMultipleSerie<MultiSerieData>;

  brush: FlChartBrush;

  constructor() {
  }

  ngOnInit(): void {
    this.series = new FlChart2dMultipleSerie<MultiSerieData>(getMultiSerieData());

    this.initChart();
    this.initBrush();
    this.initHover();
  }


  private initChart(): void {

    const svg: FlChartSvg = new FlChartSvg(460, 400).initSvg(this.chartHtmlContainer.nativeElement);
    const chart: FlChartContainer2d<FlChart2dMultipleSerie<MultiSerieData>> = new FlChartContainer2d(svg.svg, svg.width, svg.height);

    const xScale: FlChartAxisScaleLinear<Numeric> = new FlChartAxisScaleNumber()
      .domain(this.series.getDomainX())
      .range(chart.getRangeX());

    const yScale: FlChartAxisScaleLinear<Numeric> = new FlChartAxisScaleNumber()
      .domain(this.series.getDomainY())
      .range(chart.getRangeY());

    chart
      .initX(xScale)
      .initY(yScale)
      .addRenderer(new FlChartRendererLineMulti())
      .initData(this.series);

    this.chart = chart;
  }

  private initBrush(): void {
    this.brush = new FlChart2dBrush(this.chart);
  }

  private initHover(): void {
    new FlChart2dHoverLine(this.chart);
  }

}
