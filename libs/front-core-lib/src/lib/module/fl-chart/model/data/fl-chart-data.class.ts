export type FlChartAxisTickFormat = (domainValue: number, index: number) => string;

/**
 * Object containing a list of data
 */
export interface FlChartDataContainer<Data> {

  getData(): Data[];
}

export class FlChart2dDatum {

  constructor(protected x: number, protected y: number,
              protected xLabel?: string, protected yLabel?: string) {
  }

  getX(): number {
    return this.x;
  }

  getY(): number {
    return this.y;
  }

  getXLabel(): string {
    return this.xLabel ?? this.getX()?.toString() ?? '';
  }

  getYLabel(): string {
    return this.yLabel ?? this.getY()?.toString() ?? '';
  }
}

export class FlChart3dDatum extends FlChart2dDatum {
  constructor(x: number, y: number, private z: number,
              xLabel?: string, yLabel?: string) {
    super(x, y, xLabel, yLabel);
  }

  getZ(): number {
    return this.z;
  }
}
