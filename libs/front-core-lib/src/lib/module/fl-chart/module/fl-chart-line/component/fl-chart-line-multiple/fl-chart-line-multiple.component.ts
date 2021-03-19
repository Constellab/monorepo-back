import {Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {FlChart2dMultipleSerie} from '../../../../model/fl-chart-2d-data.class';
import {getMultiSerieData, MultiSerieData} from '../../../../model/data';
import {FlChart2d} from '../../../../model/fl-chart-2d.class';
import {FlChart2dLineMulti} from '../../model/fl-chart-2d-line-multi.class';
import {FlChartAxisScale, FlChartAxisScaleNumber} from '../../../../model/fl-chart-scale.class';
import {Numeric} from 'd3';
import {FlChart2dBrush, FlChartBrush} from '../../../../model/fl-chart-2d-brush.class';
import {FlChart2dHoverLine} from '../../../../model/fl-chart-2d-hover.class';


@Component({
  selector: 'fl-chart-line-multiple',
  templateUrl: './fl-chart-line-multiple.component.html',
  styleUrls: ['./fl-chart-line-multiple.component.scss']
})
export class FlChartLineMultipleComponent implements OnInit {

  @ViewChild('chart', {static: true}) chartHtmlContainer: ElementRef<HTMLElement>;

  chart: FlChart2d<MultiSerieData>;

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

    const chart: FlChart2dLineMulti<MultiSerieData> = new FlChart2dLineMulti<MultiSerieData>(460, 400);

    const xScale: FlChartAxisScale<Numeric> = new FlChartAxisScaleNumber()
      .domain(this.series.getExtentX())
      .range(chart.getRangeX());

    const yScale: FlChartAxisScale<Numeric> = new FlChartAxisScaleNumber()
      .domain(this.series.getExtentY())
      .range(chart.getRangeY());

    chart.initSvg(this.chartHtmlContainer.nativeElement)
      .initX(xScale)
      .initY(yScale)
      .initColor(this.series.series)
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
