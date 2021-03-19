import * as d3 from 'd3';
import {Numeric} from 'd3';

export interface FlChart2dDatum {

  getX(): Numeric;

  getY(): Numeric;
}

export interface FlChart2dDataContainer<Data> {

  getData(): Data[];

  getExtentX(): [Numeric, Numeric];

  getExtentY(): [Numeric, Numeric];
}


export class FlChart2dData<Data extends FlChart2dDatum> implements FlChart2dDataContainer<Data> {

  data: Data[];


  constructor(data: Data[]) {
    this.data = data;
  }

  getData(): Data[] {
    return this.data;
  }


  getExtentX(): [Numeric, Numeric] {
    return d3.extent(this.data, (data: Data) => data.getX());
  }

  getExtentY(): [Numeric, Numeric] {
    return d3.extent(this.data, (data: Data) => data.getY());
  }
}

export type SerieType = Numeric | string;

export interface FlChart2dDatumSerie extends FlChart2dDatum {

  getSerie(): SerieType;
}

export class FlChart2dSerie<Data extends FlChart2dDatumSerie> extends FlChart2dData<Data> {

  serie: SerieType;

  constructor(data: Data[], serie: SerieType) {
    super(data);
    this.serie = serie;
  }

}

export class FlChart2dMultipleSerie<Data extends FlChart2dDatumSerie> implements FlChart2dDataContainer<Data> {

  series: FlChart2dSerie<Data>[];


  constructor(series: FlChart2dSerie<Data>[]) {
    this.series = series;
  }

  // flatten the data of the series
  getData(): Data[] {
    const data: Data[] = [];
    this.series.forEach(serie => data.push(...serie.getData()));
    return data;
  }


  getExtentX(): [Numeric, Numeric] {
    return d3.extent(this.getData(), (data: Data) => data.getX());
  }

  getExtentY(): [Numeric, Numeric] {
    return d3.extent(this.getData(), (data: Data) => data.getY());
  }
}


///////////////////////// HISTOGRAM ////////////////////
export interface FlChart2dHistogramDatum {

  getX0(): Numeric;

  getX1(): Numeric;

  getYCount(): number;
}

export class FlChart2dHistoDataContainer<Data extends FlChart2dHistogramDatum>
  implements FlChart2dDataContainer<Data> {

  data: Data[];

  constructor(data: Data[]) {
    this.data = data;
  }

  getData(): Data[] {
    return this.data;
  }

  getExtentX(): [Numeric, Numeric] {
    return [
      d3.min(this.getData(), (data: Data) => data.getX0()),
      d3.max(this.getData(), (data: Data) => data.getX1())
    ];
  }

  getExtentY(): [Numeric, Numeric] {
    return d3.extent(this.getData(), (data: Data) => data.getYCount());
  }


}
