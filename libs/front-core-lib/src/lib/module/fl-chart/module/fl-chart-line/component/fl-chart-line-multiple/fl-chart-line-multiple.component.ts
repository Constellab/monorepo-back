import {Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {FlChart2dDatumSerie, FlChart2dMultipleSerie, FlChart2dSerie, SerieType} from '../../../../model/fl-chart-2d-data.class';
import {multipleSeries} from '../../../../model/data';
import {FlChart2d} from '../../../../model/fl-chart-2d.class';
import {FlChart2dLineMulti} from '../../../../model/fl-chart-2d-line-multi.class';
import {FlChartAxisScale, FlChartAxisScaleNumber} from '../../../../model/fl-chart-scale.class';
import {Numeric} from 'd3';
import {FlChart2dBrushY, FlChartBrush} from '../../../../model/fl-chart-2d-brush.class';

class Data implements FlChart2dDatumSerie {
  constructor(private year: number,
              private value: number,
              private serie: string) {
  }

  getSerie(): SerieType {
    return this.serie;
  }


  getX(): number {
    return this.year;
  }

  getY(): number {
    return this.value;
  }
}

@Component({
  selector: 'fl-chart-line-multiple',
  templateUrl: './fl-chart-line-multiple.component.html',
  styleUrls: ['./fl-chart-line-multiple.component.scss']
})
export class FlChartLineMultipleComponent implements OnInit {

  @ViewChild('chart', {static: true}) chartHtmlContainer: ElementRef<HTMLElement>;

  chart: FlChart2d<Data>;

  series: FlChart2dMultipleSerie<Data>;

  brush: FlChartBrush;

  constructor() {
  }

  ngOnInit(): void {
    this.series = this.getData();

    this.initChart();
    this.initBrush();
  }

  private getData(): FlChart2dMultipleSerie<Data> {
    const series: FlChart2dSerie<Data>[] = [];
    for (const serie of multipleSeries) {
      series.push(new FlChart2dSerie<Data>(
        serie.values.map(data => new Data(parseInt(data.year), parseInt(data.n), data.name))
        , serie.key));
    }

    return new FlChart2dMultipleSerie<Data>(series);
  }


  private initChart(): void {

    const chart: FlChart2dLineMulti<Data> = new FlChart2dLineMulti<Data>(460, 400);

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
    this.brush = new FlChart2dBrushY(this.chart);

  }


}
