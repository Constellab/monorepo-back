import {Numeric} from 'd3';

export type FlChartAxisTickFormat = (domainValue: Numeric, index: number) => string;

/**
 *
 */
export interface FlChartDataContainer<Data> {

  getData(): Data[];
}

export interface FlChart2dDatum {

  getX(): Numeric;

  getY(): Numeric;
}

export class FlChart2dDatumNumber implements FlChart2dDatum {

  constructor(private x: number, private y: number) {
  }

  getX(): number {
    return this.x;
  }

  getY(): number {
    return this.y;
  }
}

