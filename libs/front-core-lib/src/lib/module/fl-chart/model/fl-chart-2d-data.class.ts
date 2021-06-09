import * as d3 from 'd3';
import {Numeric} from 'd3';
import {FlChartDomain} from './fl-chart-domain.class';

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

  getDomainX(): Numeric[];

  getDomainY(): [Numeric, Numeric];
}


export interface FlChart2dDataContainerLinearI<Data> extends FlChart2dDataContainerI<Data> {

  getDomainX(): [Numeric, Numeric];
}

export interface FlChart2dDatum {

  getX(): Numeric;

  getY(): Numeric;
}

export abstract class FlChart2dDataContainer<Data extends FlChart2dDatum>
  implements FlChart2dDataContainerI<Data> {

  data: Data[];

  domainX: FlChartDomain;

  axisXLabelFormat: FlChartAxisTickFormat | null;

  protected constructor(data: Data[], domainX: FlChartDomain) {
    this.data = data;
    this.domainX = domainX;
  }

  public getData(): Data[] {
    return this.data;
  }

  getDomainX(): Numeric[] {
    return this.domainX.getDomain(this.data, (data: Data) => data.getX());
  }

  public getDomainY(): [Numeric, Numeric] {
    return d3.extent(this.data, (data: Data) => data.getY());
  }
}

////////////////////// HEAT MAP ////////////////////

export interface FlChartHeatMapDatum extends FlChart2dDatum {

  getValue(): number;
}


// export class FlChartHeatMapContainer implements
