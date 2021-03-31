import * as d3 from 'd3';
import {Numeric} from 'd3';

export type FlChartAxisTickFormat = (domainValue: Numeric, index: number) => string;

export interface FlChart2dDataContainerI<Data> {

  getData(): Data[];

  getDomainX(): Numeric[];

  getDomainY(): Numeric[];

  setXAxisFormat(format: FlChartAxisTickFormat): this;

  getXAxisFormat(): FlChartAxisTickFormat;
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

  format: FlChartAxisTickFormat | null;


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

  setXAxisFormat(format: FlChartAxisTickFormat): this {
    this.format = format;
    return this;
  }

  getXAxisFormat(): FlChartAxisTickFormat {
    return this.format;
  }


}

////////////////////// HEAT MAP ////////////////////

export interface FlChartHeatMapDatum extends FlChart2dDatum {

  getValue(): number;
}


// export class FlChartHeatMapContainer implements
