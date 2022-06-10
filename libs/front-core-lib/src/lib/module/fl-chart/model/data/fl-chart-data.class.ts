export type FlChartAxisTickFormat = (domainValue: number, index: number) => string;

/**
 * Object containing a list of data
 */
export interface FlChartDataContainer<Data> {

  getData(): Data[];
}

export interface FlChartData {

  /**
   * Value of getter that tell if the chart data is valid and can be added to the chart
   */
  valid: boolean;

  tags?: Record<string, string>;
}

export class FlChart2dDatum implements FlChartData {

  tags?: Record<string, string>

  constructor(protected x: number, protected y: number,
              protected xLabel?: string, protected yLabel?: string) {
  }

  getX(defaultValue: number = null): number {
    return this.x ?? defaultValue;
  }

  getY(defaultValue: number = null): number {
    return this.y ?? defaultValue;
  }

  getXLabel(): string {
    return this.xLabel ?? this.getX()?.toString() ?? '';
  }

  getYLabel(): string {
    return this.yLabel ?? this.getY()?.toString() ?? '';
  }

  get valid(): boolean {
    return this.x != null && this.y != null;
  }


}

export class FlChart3dDatum extends FlChart2dDatum {
  constructor(x: number, y: number, private z: number,
              xLabel?: string, yLabel?: string) {
    super(x, y, xLabel, yLabel);
  }

  getZ(defaultValue: number = null): number {
    return this.z ?? defaultValue;
  }

  get valid(): boolean {
    return this.x != null && this.y != null && this.z != null;
  }
}
