import {FlChartLegend} from './fl-chart-legend.class';
import {Selection} from 'd3-selection';
import {FlChartScaleColor} from '../scale/fl-chart-scale-color.class';
import {axisBottom, scaleLinear} from 'd3';

/**
 * Class to draw an heat map legend
 */
export class FlChartLegendHeatMap extends FlChartLegend {

  private readonly rectHeight: number = 20;
  private readonly padding: number = 10;

  constructor(parent: Selection<any, any, any, any>, width: number,
              height: number, private colorScale: FlChartScaleColor,
              private domain: [number, number]) {
    super(parent, width, height);
  }


  renderLegend(): void {
    this.drawLegendRect();
    this.drawLegendAxis();
  }

  private drawLegendRect(): void {
    this.parent.append('defs')
      .append('linearGradient')
      .attr('id', 'legend-traffic')
      .attr('x1', '0%').attr('y1', '0%')
      .attr('x2', '100%').attr('y2', '0%')
      .selectAll('stop')
      .data(this.domain)
      .enter().append('stop')
      .attr('offset', (d, i) => i === 0 ? 0 : 200)
      .attr('stop-color', (d) => this.colorScale.scale(d));

    this.parent.append('rect') // rectangle avec gradient
      .attr('class', 'legendRect')
      .attr('x', this.padding)
      .attr('y', 0)
      .attr('width', this.getWidth())
      .attr('height', this.rectHeight)
      .style('fill', 'url(#legend-traffic)');
  }

  private drawLegendAxis(): void {
    const domainScale = scaleLinear()
      .domain(this.domain)
      .range([0, this.getWidth()]);

    this.parent.append('g') // x axis
      .attr('class', 'axis')
      .attr('transform', `translate(${this.padding},${this.rectHeight})`)
      .call(axisBottom(domainScale));
  }

  private getWidth(): number {
    return this.width - (this.padding * 2);
  }


}
