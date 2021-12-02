import {FlChartLegend} from './fl-chart-legend.class';
import {Selection} from 'd3-selection';
import {FlChartScaleColor} from '../scale/fl-chart-scale-color.class';
import {axisBottom, scaleLinear} from 'd3';

/**
 * Class to draw a heat map legend
 */
export class FlChartLegendHeatMap extends FlChartLegend {


  constructor(private colorScale: FlChartScaleColor,
              private domain: [number, number]) {
    super();
  }


  renderLegend(parent: Selection<any, any, any, any>, width: number, height: number): void {

    const padding: number = height / 5;
    const widthWithoutPadding = width - (padding * 2);
    const rectHeight: number = height / 2;
    this.drawLegendRect(parent, widthWithoutPadding, padding, rectHeight);
    this.drawLegendAxis(parent, widthWithoutPadding, padding, rectHeight);
  }

  private drawLegendRect(parent: Selection<any, any, any, any>, width: number,
                         padding: number, rectHeight: number): void {
    parent.append('defs')
      .append('linearGradient')
      .attr('id', 'legend-traffic')
      .attr('x1', '0%').attr('y1', '0%')
      .attr('x2', '100%').attr('y2', '0%')
      .selectAll('stop')
      .data(this.domain)
      .enter().append('stop')
      .attr('offset', (d, i) => i === 0 ? 0 : 200)
      .attr('stop-color', (d) => this.colorScale.scale(d));

    parent.append('rect') // gradient rect
      .attr('class', 'legendRect')
      .attr('x', padding)
      .attr('y', 0)
      .attr('width', width)
      .attr('height', rectHeight / 2)
      .style('fill', 'url(#legend-traffic)');
  }

  private drawLegendAxis(parent: Selection<any, any, any, any>, width: number,
                         padding: number, rectHeight: number): void {
    const domainScale = scaleLinear()
      .domain(this.domain)
      .range([0, width]);

    parent.append('g') // x axis
      .attr('class', 'axis')
      .attr('transform', `translate(${padding},${rectHeight})`)
      .call(axisBottom(domainScale));
  }


}
