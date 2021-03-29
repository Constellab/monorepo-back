import * as d3 from 'd3';
import {ScaleOrdinal} from 'd3';
import {SerieKey} from './fl-chart-2d-data.class';

export class FlChartScaleColor {

  public readonly d3Scale: ScaleOrdinal<string, string>;

  constructor() {
    this.d3Scale = this.initScale();
  }

  private initScale(): ScaleOrdinal<string, string> {
    // the range contains all available colors
    return d3.scaleOrdinal<string>(['#e41a1c', '#377eb8', '#4daf4a', '#984ea3',
      '#ff7f00', '#ffff33', '#a65628', '#f781bf', '#999999']);
  }

  public domain(domain: SerieKey[]): this {
    this.d3Scale.domain(domain.map(d => d.toString()));
    return this;
  }

  public scale(value: SerieKey): string {
    return this.d3Scale(value.toString());
  }
}
