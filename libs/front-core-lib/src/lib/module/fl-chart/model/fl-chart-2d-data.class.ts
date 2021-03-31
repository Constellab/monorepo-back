import * as d3 from 'd3';
import {Numeric} from 'd3';

export interface FlChart2dDataContainerI<Data> {

  getData(): Data[];

  getDomainX(): Numeric[];

  getDomainY(): Numeric[];
}


export interface FlChart2dDataContainerLinear<Data> extends FlChart2dDataContainerI<Data> {

  getData(): Data[];

  getDomainX(): [Numeric, Numeric];

  getDomainY(): [Numeric, Numeric];
}

export interface FlChart2dDatum {

  getX(): Numeric;

  getY(): Numeric;

  // todo use the label in tickformat of axis
  getXLabel(): string;

  getYLabel(): string;
}

export class FlChart2dDataContainer<Data extends FlChart2dDatum>
  implements FlChart2dDataContainerLinear<Data> {

  data: Data[];


  constructor(data: Data[]) {
    this.data = data;
  }

  getData(): Data[] {
    return this.data;
  }


  getDomainX(): [Numeric, Numeric] {
    return d3.extent(this.data, (data: Data) => data.getX());
  }

  getDomainY(): [Numeric, Numeric] {
    return d3.extent(this.data, (data: Data) => data.getY());
  }
}

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
}


////////////////////// HEAT MAP ////////////////////

export interface FlChartHeatMapDatum extends FlChart2dDatum {

  getValue(): number;
}


// export class FlChartHeatMapContainer implements
