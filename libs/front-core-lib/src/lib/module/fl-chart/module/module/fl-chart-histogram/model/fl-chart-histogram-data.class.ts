import {extent, Numeric, min, max} from 'd3';
import {FlChart2dDataContainerLinearI, FlChartAxisTickFormat} from '../../../../model/fl-chart-2d-data.class';

export interface FlChart2dHistogramDatum {

  getX0(): Numeric;

  getX1(): Numeric;

  getYCount(): number;
}

export class FlChart2dHistoDataContainer<Data extends FlChart2dHistogramDatum>
  implements FlChart2dDataContainerLinearI<Data> {

  data: Data[];

  axisXFormat: FlChartAxisTickFormat | null;

  constructor(data: Data[]) {
    this.data = data;
  }

  getData(): Data[] {
    return this.data;
  }

  getDomainX(): [Numeric, Numeric] {
    return [
      min(this.getData(), (data: Data) => data.getX0()),
      max(this.getData(), (data: Data) => data.getX1())
    ];
  }

  getDomainY(): [Numeric, Numeric] {
    return extent(this.getData(), (data: Data) => data.getYCount());
  }
}
