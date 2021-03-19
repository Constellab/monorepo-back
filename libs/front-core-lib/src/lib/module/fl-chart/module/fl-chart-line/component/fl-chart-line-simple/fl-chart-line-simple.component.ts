import {Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {Numeric} from 'd3';
import {FlChart2d} from '../../../../model/fl-chart-2d.class';
import {FlChartAxisScale, FlChartAxisScaleDate, FlChartAxisScaleNumber} from '../../../../model/fl-chart-scale.class';
import {FlChart2dLine} from '../../model/fl-chart-2d-line.class';
import {FlChart2dData, FlChart2dDataContainer} from '../../../../model/fl-chart-2d-data.class';
import {FlChart2dBrushX, FlChartBrush} from '../../../../model/fl-chart-2d-brush.class';
import {FlChart2dHoverLine} from '../../../../model/fl-chart-2d-hover.class';
import {getSingleSerieData, SingleSerieData} from '../../../../model/data';

@Component({
  selector: 'fl-chart-line-simple',
  templateUrl: './fl-chart-line-simple.component.html',
  styleUrls: ['./fl-chart-line-simple.component.scss']
})
export class FlChartLineSimpleComponent implements OnInit {

  @ViewChild('chart', {static: true}) chartHtmlContainer: ElementRef<HTMLElement>;

  chart: FlChart2d<SingleSerieData>;

  data: FlChart2dDataContainer<SingleSerieData>;

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
    this.data = new FlChart2dData(data);

    const chart: FlChart2d<SingleSerieData> = new FlChart2dLine<SingleSerieData>(460, 400);

    const xScale: FlChartAxisScale<Numeric> = new FlChartAxisScaleDate()
      .domain(this.data.getExtentX())
      .range(chart.getRangeX());

    const yScale: FlChartAxisScale<Numeric> = new FlChartAxisScaleNumber()
      .domain(this.data.getExtentY())
      .range(chart.getRangeY());

    chart.initSvg(this.chartHtmlContainer.nativeElement)
      .initX(xScale)
      .initY(yScale)
      .initData(this.data);

    this.chart = chart;
  }

  private initBrush(): void {
    this.brush = new FlChart2dBrushX(this.chart);
  }

  private initHover(): void {
    new FlChart2dHoverLine(this.chart);
  }
}
