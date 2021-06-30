import * as d3 from 'd3';
import {Numeric} from 'd3';
import {FlChart2dDataContainerI, FlChart2dDatum, FlChartAxisTickFormat} from './fl-chart-2d-data.class';
import {FlChart2dSerie, FlChartDataWithSerie} from './fl-chart-2d-serie.class';
import {FlChartDomain} from './fl-chart-domain.class';

export class FlChart2dMultiSerie<Data extends FlChart2dDatum> implements FlChart2dDataContainerI<Data> {

  series: FlChart2dSerie<Data>[];

  axisXLabelFormat: FlChartAxisTickFormat | null;

  domainX: FlChartDomain;


  constructor(domainX: FlChartDomain, series: FlChart2dSerie<Data>[] = []) {
    this.domainX = domainX;
    this.series = series;
  }

  // flatten the data of the series
  getData(): Data[] {
    const data: Data[] = [];
    this.series.forEach(serie => data.push(...serie.getData()));
    return data;
  }


  getDomainX(): Numeric[] {
    return this.domainX.getDomain(this.getData(), (data) => data.getX());
  }

  getDomainY(): [Numeric, Numeric] {
    return d3.extent(this.getData(), (data: Data) => data.getY());
  }

  public addSerie(serie: FlChart2dSerie<Data>): void {
    // override the key of the serie with the index
    serie.key = this.series.length;
    this.series.push(serie);
  }

  public countSerie(): number {
    return this.series.length;
  }

  // return the biggest number of data for a serie
  public maxSerieDataCount(): number {
    return this.series.reduce(
      (p, c) => c.countData() > p?.countData() ?? 0 ? c : p)
      .countData();
  }

  /**
   * return an array of data with serie
   * The first array contains all the series first value,
   * the second array all the series second value ...
   */
  public invert(): FlChartDataWithSerie[][] {
    const max: number = this.maxSerieDataCount();

    const data: FlChartDataWithSerie[][] = [];
    for (let i = 0; i < max; i++) {
      const d: FlChartDataWithSerie[] = [];

      for (const serie of this.series) {
        d.push(serie.getDataWithSerieAt(i));
      }

      data.push(d);
    }

    return data;
  }

  // return an array of series keys
  public getSeriesKeys(): number[] {
    return this.series.map((v) => v.key);
  }

}
