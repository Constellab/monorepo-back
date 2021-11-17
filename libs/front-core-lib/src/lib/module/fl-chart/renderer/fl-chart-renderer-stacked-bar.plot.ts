import {FlChart2dRenderer, FlChart2dRendererInput} from './fl-chart-2d-renderer.class';
import {FlChart2dMultiSerie} from '../model/data/fl-chart-multi-serie.class';
import {FlChart2dDatum} from '../model/data/fl-chart-data.class';
import {Stack, stack} from 'd3';
import {FlChartDataWithSerie} from '../model/data/fl-chart-serie.class';
import {FlChartScaleColor} from '../model/scale/fl-chart-scale-color.class';

/**
 * Renderer for stack stack bar plot or histogram
 */
export class FlChartRendererStackedBarPlot implements FlChart2dRenderer<FlChart2dMultiSerie<FlChart2dDatum>> {

  constructor(public colorScale: FlChartScaleColor) {
  }

  initData(input: FlChart2dRendererInput<FlChart2dMultiSerie<FlChart2dDatum>>): void {

    const data: FlChartDataWithSerie<FlChart2dDatum>[][] = input.data.invert();

    const keys: number[] = [];
    for (let i = 0; i < data[0].length; i++) {
      keys.push(i)
    }
    console.log(data)

    const stack2: Stack<any, FlChartDataWithSerie<FlChart2dDatum>[], number> = stack<any, any, number>();
    stack2.keys(keys).value((d: FlChartDataWithSerie<FlChart2dDatum>[], key) => d[key].data.getY() as number)
    const stackedData = stack2(data)
    console.log(stackedData)

    // Show the bars
    // input.container.append('g')
    //   .selectAll('g')
    //   // Enter in the stack data = loop key per key = group per group
    //   .data(stackedData)
    //   .join('g')
    //   .attr('fill', d => this.colorScale.scale(d.key))
    //   .selectAll('rect')
    //   // enter a second time = loop subgroup per subgroup to add all rectangles
    //   .data(d => d)
    //   .join('rect')
    //   .attr('x', (d, index) => input.xScale.scale(index))
    //   .attr('y', d => input.yScale.scale(d[1]))
    //   .attr('height', d => input.yScale.scale(d[0]) - input.yScale.scale(d[1]))
    //   .attr('width', input.xScale.bandwidth())
  }

  refreshData(input: FlChart2dRendererInput<FlChart2dMultiSerie<FlChart2dDatum>>): void {
  }


}
