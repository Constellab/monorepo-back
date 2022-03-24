import {FlChartLegend} from './fl-chart-legend.class';
import {Selection} from 'd3-selection';
import {FlChartScaleColor} from '../scale/fl-chart-scale-color.class';
import {axisRight, scaleLinear} from 'd3';

/**
 * Class to draw a heat map legend
 */
export class FlChartLegendHeatMap extends FlChartLegend {


  constructor(private colorScale: FlChartScaleColor,
              private domain: [number, number]) {
    super();
  }


  renderLegend(parent: Selection<any, any, any, any>, width: number, height: number): void {

    const topMargin: number = 5;
    const leftMargin = 20
    const rectWidth = 10;
    const rectHeight = Math.min(height - (topMargin * 2), 200);
    this.drawLegendRect(parent, rectWidth, rectHeight, topMargin, leftMargin);
    this.drawLegendAxis(parent, rectWidth + leftMargin, rectHeight, topMargin);
  }

  private drawLegendRect(parent: Selection<any, any, any, any>,
                         rectWidth: number, rectHeight: number,
                         topMargin: number, leftMaring: number): void {
    parent.append('defs')
      .append('linearGradient')
      .attr('id', 'legend-traffic')
      .attr('x1', '0%').attr('y1', '0%')
      .attr('x2', '0%').attr('y2', '100%')
      .selectAll('stop')
      .data(this.domain)
      .enter().append('stop')
      .attr('offset', (d, i) => i === 0 ? 0 : 200)
      .attr('stop-color', (d) => this.colorScale.scale(d));

    parent.append('rect') // gradient rect
      .attr('class', 'legendRect')
      .attr('x', leftMaring)
      .attr('y', topMargin)
      .attr('width', rectWidth)
      .attr('height', rectHeight)
      .style('fill', 'url(#legend-traffic)');
  }

  private drawLegendAxis(parent: Selection<any, any, any, any>, x: number, rectHeight: number, topMargin: number,): void {
    const domainScale = scaleLinear()
      .domain(this.domain)
      .range([0, rectHeight]);

    parent.append('g') // x axis
      .attr('class', 'axis')
      .attr('transform', `translate(${x}, ${topMargin})`)
      .call(axisRight(domainScale));
  }


}
