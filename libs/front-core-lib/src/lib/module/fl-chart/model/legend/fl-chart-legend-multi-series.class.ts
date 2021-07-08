import {FlChartLegend} from './fl-chart-legend.class';
import {Selection} from 'd3-selection';
import {FlChartScaleColor} from '../scale/fl-chart-scale-color.class';
import {FlChartMultiSerie} from '../data/fl-chart-multi-serie.class';


/**
 * Class to draw legend for multi series charts
 */
export class FlChartLegendMultiSeries extends FlChartLegend {

  private readonly circleRadius: number = 5;

  constructor(parent: Selection<any, any, any, any>, width: number,
              height: number,
              private series: FlChartMultiSerie<any>,
              public colorScale: FlChartScaleColor) {
    super(parent, width, height);
  }

  renderLegend(): void {
    let size: number = this.width / this.series.series.length;
    let offset: number = this.circleRadius;

    // if there is enough space for an offset
    if (size > 50) {
      offset = 20;
      size = (this.width - offset) / this.series.series.length;
    }

    const legend = this.parent.selectAll()
      .data(this.series.series)
      .enter().append('g')
      .attr('transform', (d, i) => `translate(${(i * size) + offset},0)`);

    legend.append('circle')
      .attr('r', this.circleRadius)
      .style('fill', d => this.colorScale.scale(d.key));

    legend.append('text')
      .attr('x', 10)
      .attr('y', 3)
      .text(d => d.name)
      .attr('fill', 'currentcolor')
      .style('font-size', 10);
  }


}
