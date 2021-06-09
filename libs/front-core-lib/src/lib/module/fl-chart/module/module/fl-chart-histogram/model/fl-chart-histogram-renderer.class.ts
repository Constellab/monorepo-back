import {FlChart2dRenderer, FlChart2dRendererInput} from '../../../../model/fl-chart-2d-renderer.class';
import {FlChart2dHistoDataContainer, FlChart2dHistogramDatum} from './fl-chart-histogram-data.class';
import {FlChartScaleColorSimple} from '../../../../model/fl-chart-scale-color.class';


export class FlChartHistogramRenderer
  implements FlChart2dRenderer<FlChart2dHistoDataContainer<FlChart2dHistogramDatum>> {

  colorScale: FlChartScaleColorSimple;

  constructor() {
    this.colorScale = new FlChartScaleColorSimple('steelblue');
  }

  initData(input: FlChart2dRendererInput<FlChart2dHistoDataContainer<FlChart2dHistogramDatum>>): void {
    input.container
      .selectAll()
      .data(input.data.getData())
      .enter()
      .append('rect')
      .attr('x', 1)
      // .each((d) => console.log(d))
      .attr('transform',
        (d: FlChart2dHistogramDatum) => 'translate(' + input.xScale.scale(d.getX1()) + ',' + input.yScale.scale(d.getYCount()) + ')'
      )
      // todo a voir pour la width, le -1 gènère une width négatif
      .attr('width', d => input.xScale.scale(d.getX1()) - input.xScale.scale(d.getX0()) - 1)
      .attr('height', d => input.chartHeight - input.yScale.scale(d.getYCount()))
      .style('fill', () => this.colorScale.scale());
  }

  refreshData(input: FlChart2dRendererInput<FlChart2dHistoDataContainer<FlChart2dHistogramDatum>>): void {
  }
}
