import {FlChartSVGLegend} from './fl-chart-legend.class';
import {Selection} from 'd3-selection';
import {FlChartScaleColor} from '../scale/fl-chart-scale-color.class';
import {ClStringHelper} from '@monorepo/core-lib';

export interface FlLegend {
  key: any; // unique key that will be used by the color scale
  name: string; // Human-readable name of the legend
}

/**
 * Class to draw legend for multi series charts
 */
export class FlChartLegendMultiSeries extends FlChartSVGLegend {

  private readonly circleRadius: number = 5;

  constructor(private legends: FlLegend[],
              public colorScale: FlChartScaleColor) {
    super();
  }

  renderLegend(parent: Selection<any, any, any, any>): void {
    const size: number = 11;
    const offset: number = this.circleRadius;

    const legend = parent.selectAll()
      .data(this.legends)
      .enter().append('g')
      .attr('transform', (d, i) => `translate(0, ${(size * i) + offset} )`);

    legend.append('circle')
      .attr('r', this.circleRadius)
      .style('fill', d => this.colorScale.scale(d.key));

    legend.append('text')
      .attr('x', 10)
      .attr('y', 3)
      .text(d => ClStringHelper.limiteLength(d.name, 15))
      .attr('fill', 'currentcolor')
      .style('font-size', 10);

    legend.append('title')
      .text(d => d.name);
  }

}
