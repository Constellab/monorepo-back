import {Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import * as d3 from 'd3';
import {Bin, Numeric} from 'd3';
import {FlChart2dHistogram} from '../../../../model/fl-chart-2d-histogram.class';
import {FlChartAxisScale, FlChartAxisScaleDate, FlChartAxisScaleNumber} from '../../../../model/fl-chart-scale.class';
import {getSingleSerieData, SingleSerieData} from '../../../../model/data';
import {
  FlChart2dData,
  FlChart2dDataContainer,
  FlChart2dHistoDataContainer,
  FlChart2dHistogramDatum
} from '../../../../model/fl-chart-2d-data.class';

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

  chart: FlChart2dHistogram<any>;

  constructor() {
  }

  ngOnInit(): void {
    const dataContainer: FlChart2dHistoDataContainer<Data> = this.getData();


    const chart: FlChart2dHistogram<any> = new FlChart2dHistogram<any>(460, 400);

    const xScale: FlChartAxisScale<Numeric> = new FlChartAxisScaleDate()
      .domain(dataContainer.getExtentX())
      .range(chart.getRangeX());

    const yScale: FlChartAxisScale<Numeric> = new FlChartAxisScaleNumber()
      .domain(dataContainer.getExtentY())
      .range(chart.getRangeY());


    chart.initSvg(this.chartHtmlContainer.nativeElement)
      .initX(xScale)
      .initY(yScale)
      .initData(dataContainer);

    this.chart = chart;
  }

  private getData(): FlChart2dHistoDataContainer<Data> {
    const simpleData: FlChart2dDataContainer<SingleSerieData> = new FlChart2dData(getSingleSerieData());

    // todo a ameliorer, la conversion en donnée histogram ce fait dans le
    // todo chart directmement ? ça permetterais de zoomer
    // todo a voir avec le format des données en entrée
    // fake scale to construct the histogram
    const xScale: FlChartAxisScale<Numeric> = new FlChartAxisScaleDate()
      .domain(simpleData.getExtentX())
      .range([0, this.chartWidth]);


    // set the parameters for the histogram
    const histogram = d3.bin<SingleSerieData, any>()
      .value(d => d.getX())   // I need to give the vector of value
      .domain(simpleData.getExtentX() as any)  // then the domain of the graphic
      .thresholds(xScale.ticks(100)); // then the numbers of bins

    // And apply this function to data to get the bins
    const bins: any[] = histogram(getSingleSerieData());

    return new FlChart2dHistoDataContainer(bins.map(bin => new Data(bin)));
  }

}
