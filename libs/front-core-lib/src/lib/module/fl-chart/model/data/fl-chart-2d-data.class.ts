import {Numeric} from 'd3';

export type FlChartAxisTickFormat = (domainValue: Numeric, index: number) => string;

/**
 *
 */
export interface FlChart2dDataContainerI<Data> {
  /**
   * Function to format the x axis labels
   */
  axisXLabelFormat: FlChartAxisTickFormat | null;

  getData(): Data[];
}


export interface FlChart2dDataContainerLinearI<Data> extends FlChart2dDataContainerI<Data> {

  getDomainX(): [Numeric, Numeric];
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


export abstract class FlChart2dDataContainer<Data extends FlChart2dDatum>
  implements FlChart2dDataContainerI<Data> {

  data: Data[];

  axisXLabelFormat: FlChartAxisTickFormat | null;

  protected constructor(data: Data[]) {
    this.data = data;
  }

  public getData(): Data[] {
    return this.data;
  }
}
