import * as d3 from 'd3';
import {Numeric} from 'd3';
import {FlChart2dDataContainer, FlChart2dDataContainerLinear, FlChart2dDatum, FlChartAxisTickFormat} from './fl-chart-2d-data.class';

/**
 * Key to distingue a serie form another
 */
export interface FlChartDataWithSerie {
  data: FlChart2dDatum;
  serieKey: number;
  serieName: string;
}


export class FlChart2dSerie<Data extends FlChart2dDatum> extends FlChart2dDataContainer<Data> {

  private static key: number = 0;

  readonly key: number;

  name: string;

  constructor(data: Data[], serieName: string) {
    super(data);
    this.key = FlChart2dSerie.key++;
    this.name = serieName;
  }

  public getDataWithSerie(): FlChartDataWithSerie[] {
    return this.getData().map(data => {
      return {
        data: data,
        serieKey: this.key,
        serieName: this.name
      };
    });
  }

}

export class FlChart2dMultipleSerie<Data extends FlChart2dDatum> implements FlChart2dDataContainerLinear<Data> {

  series: FlChart2dSerie<Data>[];

  format: FlChartAxisTickFormat | null;


  constructor(series: FlChart2dSerie<Data>[] = []) {
    this.series = series;
  }

  // flatten the data of the series
  getData(): Data[] {
    const data: Data[] = [];
    this.series.forEach(serie => data.push(...serie.getData()));
    return data;
  }


  getDomainX(): [Numeric, Numeric] {
    return d3.extent(this.getData(), (data: Data) => data.getX());
  }

  getDomainY(): [Numeric, Numeric] {
    return d3.extent(this.getData(), (data: Data) => data.getY());
  }

  public addSerie(serie: FlChart2dSerie<Data>): void {
    this.series.push(serie);
  }

  public setXAxisFormat(format: FlChartAxisTickFormat): this {
    this.format = format;
    return this;
  }

  getXAxisFormat(): FlChartAxisTickFormat {
    return this.format;
  }

}
