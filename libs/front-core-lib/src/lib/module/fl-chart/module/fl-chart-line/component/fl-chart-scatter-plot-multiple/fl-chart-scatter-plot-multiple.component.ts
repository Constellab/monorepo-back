import {Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {FlChart2d} from '../../../../model/fl-chart-2d.class';
import {getMultiSerieData, MultiSerieData} from '../../../../model/data';
import {FlChart2dMultipleSerie} from '../../../../model/fl-chart-2d-data.class';
import {FlChartAxisScale, FlChartAxisScaleDate, FlChartAxisScaleNumber} from '../../../../model/fl-chart-scale.class';
import {Numeric} from 'd3';
import {FlChart2dBrush} from '../../../../model/fl-chart-2d-brush.class';
import {FlChart2dScatterPlotMulti} from '../../../../model/fl-chart-2d-scatter-plot-multi.class';

@Component({
  selector: 'fl-chart-scatter-plot-multiple',
  templateUrl: './fl-chart-scatter-plot-multiple.component.html',
  styleUrls: ['./fl-chart-scatter-plot-multiple.component.scss']
})
export class FlChartScatterPlotMultipleComponent implements OnInit {

  @ViewChild('chart', {static: true}) chartHtmlContainer: ElementRef<HTMLElement>;

  series: FlChart2dMultipleSerie<MultiSerieData>;

  chart: FlChart2d<MultiSerieData>;

  constructor() {
  }

  ngOnInit(): void {
    this.series = new FlChart2dMultipleSerie<MultiSerieData>(getMultiSerieData());

    this.initChart();
    this.initBrush();
  }


  private initChart(): void {

    const chart: FlChart2dScatterPlotMulti<MultiSerieData> = new FlChart2dScatterPlotMulti<MultiSerieData>(460, 400);

    const xScale: FlChartAxisScale<Numeric> = new FlChartAxisScaleDate()
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
    new FlChart2dBrush(this.chart);
  }

}
