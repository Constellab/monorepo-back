export type FlChartAxisTickFormat = (domainValue: number, index: number) => string;

/**
 * Object containing a list of data
 */
export interface FlChartDataContainer<Data> {

  getData(): Data[];
}

export class FlChart2dDatum {

  constructor(protected x: number, protected y: number) {
  }

  getX(): number {
    return this.x;
  }

  getY(): number {
    return this.y;
  }
}

export class FlChart3dDatum extends FlChart2dDatum {
  constructor(x: number, y: number, private z: number) {
    super(x, y);
  }

  getZ(): number {
    return this.z;
  }
}
