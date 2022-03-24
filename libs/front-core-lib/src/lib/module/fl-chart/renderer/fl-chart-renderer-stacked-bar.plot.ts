import {FlChart2AxisRenderer, FlChart2AxisRendererInput} from './fl-chart-renderer.class';
import {FlChart2dMultiSerie} from '../model/data/fl-chart-multi-serie.class';
import {FlChart2dDatum} from '../model/data/fl-chart-data.class';
import {select, Series, SeriesPoint, Stack, stack} from 'd3';
import {FlChartDataWithSerie} from '../model/data/fl-chart-serie.class';
import {FlChartScaleColor} from '../model/scale/fl-chart-scale-color.class';
import {FlChartScaleBand} from '../model/scale/fl-chart-scale.class';
import {
  FlChartDataWithSeriePortalComponent,
  FlChartDataWithSeriePortalInput
} from '../component/fl-chart-data-with-serie-portal/fl-chart-data-with-serie-portal.component';
import {FlChartPortalHandler} from '../model/portal-handler/fl-chart-portal-handler.class';
import {FlD3SelectionSimple} from '../model/fl-d3.class';

/**
 * Renderer for stack stack bar plot or histogram
 */
export class FlChartRendererStackedBarPlot implements FlChart2AxisRenderer<FlChart2dMultiSerie<FlChart2dDatum>> {

  private readonly barGroupClassName: string = 'bar-group';
  private readonly barClassName: string = 'bar';
  private portalHandler: FlChartPortalHandler = new FlChartPortalHandler();


  constructor(public colorScale: FlChartScaleColor) {
  }

  initData(input: FlChart2AxisRendererInput<FlChart2dMultiSerie<FlChart2dDatum>>): void {
    this.refreshData(input);
  }

  refreshData(input: FlChart2AxisRendererInput<FlChart2dMultiSerie<FlChart2dDatum>>): void {
    const stackedData = this.getStackedData(input.data);

    // Show the bars
    input.container
      .selectAll(`.${this.barGroupClassName}`)
      // Enter in the stack data = loop key per key = group per group
      // first group is the first serie, second group the second serie
      .data(stackedData)
      .join('g')
      .attr('class', this.barGroupClassName)
      .attr('fill', d => this.colorScale.scale(d.key))

      .selectAll('rect')
      // enter a second time = loop subgroup per subgroup to add all rectangles
      .data(d => d)
      .join('rect')
      .on('mouseover', (event, d) => this.onMouseHover(event, d))
      .on('click', () => this.onMouseClick())
      .on('mouseout', () => this.onMouseOut())
      .attr('class', this.barClassName)
      .each((data, index, nodes) =>
        this.drawBars(nodes[index] as any, input));
  }

  private drawBars(group: SVGElement, input: FlChart2AxisRendererInput<FlChart2dMultiSerie<FlChart2dDatum>>): void {
    const selection: FlD3SelectionSimple<SeriesPoint<FlChartDataWithSerie<FlChart2dDatum>>> = select(group);

    selection
      // use the x from the first data because there have the same X, if return undefined, set to chartWidth to hide it
      .attr('x', d => input.xScale.scale(d.data[0].data.getX(), input.chartWidth))
      .attr('y', d => input.yScale.scale(d[1]))
      .attr('height', d => input.yScale.scale(d[0]) - input.yScale.scale(d[1]))
      .attr('width', (input.xScale as FlChartScaleBand).bandwidth());
  }

  private onMouseHover(event: MouseEvent, d: SeriesPoint<FlChartDataWithSerie<FlChart2dDatum>[]>): void {
    const data: FlChartDataWithSeriePortalInput = {
      data: d.data,
      seriesColorScale: this.colorScale
    };

    // create the portal
    this.portalHandler.openPortal(event.target as any, FlChartDataWithSeriePortalComponent, data);
  }

  private onMouseClick(): void {
    this.portalHandler.fixPortal();
  }

  private onMouseOut(): void {
    this.portalHandler.closePortal();
  }

  // format of one stack data : [0] = y1; [1] = y2; .data=FlChartDataWithSerie
  private getStackedData(series: FlChart2dMultiSerie<FlChart2dDatum>): Series<FlChartDataWithSerie<FlChart2dDatum>[], number>[] {
    const data: FlChartDataWithSerie<FlChart2dDatum>[][] = series.invert();

    const keys: number[] = data[0].map((_, i) => i);

    const stackFunction: Stack<any, FlChartDataWithSerie<FlChart2dDatum>[], number> = stack<any, any, number>();
    stackFunction.keys(keys).value((d: FlChartDataWithSerie<FlChart2dDatum>[], key) => d[key].data.getY()).order();
    // build stacked data
    return stackFunction(data);
  }


}
