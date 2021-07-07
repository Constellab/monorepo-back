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

export interface FlChart3dDatum extends FlChart2dDatum {
  getZ(): Numeric;
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

export class FlChart3dDatumNumber extends FlChart2dDatumNumber implements FlChart3dDatum {

  constructor(x: number, y: number, private z: number) {
    super(x, y);
  }

  getZ(): Numeric {
    return this.z;
  }
}

