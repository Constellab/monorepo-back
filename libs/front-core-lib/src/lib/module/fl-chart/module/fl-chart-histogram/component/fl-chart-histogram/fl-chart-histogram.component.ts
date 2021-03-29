import {Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import * as d3 from 'd3';
import {Bin, Numeric} from 'd3';
import {FlChartAxisScaleDate, FlChartAxisScaleLinear, FlChartAxisScaleNumber} from '../../../../model/fl-chart-scale.class';
import {getSingleSerieData, SingleSerieData} from '../../../../model/data';
import {FlChart2dDataContainer, FlChart2dDataContainerLinear,} from '../../../../model/fl-chart-2d-data.class';
import {FlChartSvg} from '../../../../model/fl-chart-svg.class';
import {FlChartContainer2d} from '../../../../model/fl-chart-container.class';
import {FlChartHistogramRenderer} from '../../model/fl-chart-histogram-renderer.class';
import {FlChart2dHistoDataContainer, FlChart2dHistogramDatum} from '../../model/fl-chart-histogram-data.class';

class Data implements FlChart2dHistogramDatum {

  bin: Bin<any, Date>;

  constructor(bin: Bin<any, Date>) {
    this.bin = bin;
  }

  getX0(): Numeric {
    return this.bin.x0;
  }

  getX1(): Numeric {
    return this.bin.x1;
  }

  getYCount(): number {
    return this.bin.length;
  }


}


@Component({
  selector: 'fl-chart-histogram',
  templateUrl: './fl-chart-histogram.component.html',
  styleUrls: ['./fl-chart-histogram.component.scss']
})
export class FlChartHistogramComponent implements OnInit {

  chartWidth: number = 460;

  @ViewChild('chart', {static: true}) chartHtmlContainer: ElementRef<HTMLElement>;

  chart: FlChartContainer2d<FlChart2dHistoDataContainer<FlChart2dHistogramDatum>>;

  constructor() {
  }

  ngOnInit(): void {
    const dataContainer: FlChart2dHistoDataContainer<Data> = this.getData();

    const svg: FlChartSvg = new FlChartSvg(460, 400).initSvg(this.chartHtmlContainer.nativeElement);
    const chart: FlChartContainer2d<FlChart2dHistoDataContainer<FlChart2dHistogramDatum>>
      = new FlChartContainer2d(svg.svg, svg.width, svg.height);

    const xScale: FlChartAxisScaleLinear<Numeric> = new FlChartAxisScaleDate()
      .domain(dataContainer.getDomainX())
      .range(chart.getRangeX());

    const yScale: FlChartAxisScaleLinear<Numeric> = new FlChartAxisScaleNumber()
      .domain(dataContainer.getDomainY())
      .range(chart.getRangeY());


    chart.initX(xScale)
      .initY(yScale)
      .addRenderer(new FlChartHistogramRenderer())
      .initData(dataContainer);

    this.chart = chart;
  }

  private getData(): FlChart2dHistoDataContainer<Data> {
    const simpleData: FlChart2dDataContainerLinear<SingleSerieData> = new FlChart2dDataContainer(getSingleSerieData());

    // todo a ameliorer, la conversion en donnée histogram ce fait dans le
    // todo chart directmement ? ça permetterais de zoomer
    // todo a voir avec le format des données en entrée
    // fake scale to construct the histogram
    const xScale: FlChartAxisScaleLinear<Numeric> = new FlChartAxisScaleDate()
      .domain(simpleData.getDomainX())
      .range([0, this.chartWidth]);


    // set the parameters for the histogram
    const histogram = d3.bin<SingleSerieData, any>()
      .value(d => d.getX())   // I need to give the vector of value
      .domain(simpleData.getDomainX() as any)  // then the domain of the graphic
      .thresholds(xScale.ticks(100)); // then the numbers of bins

    // And apply this function to data to get the bins
    const bins: any[] = histogram(getSingleSerieData());

    return new FlChart2dHistoDataContainer(bins.map(bin => new Data(bin)));
  }

}
