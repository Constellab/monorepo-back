import {FlChart2dDatum} from '../model/data/fl-chart-data.class';
import {FlChart2dRenderer, FlChart2dRendererInput} from './fl-chart-2d-renderer.class';
import {FlChartDataWithSerie} from '../model/data/fl-chart-serie.class';
import {FlChartDataWithSeriePortalHandler} from '../model/portal-handler/fl-chart-data-with-serie-portal-handler.class';
import {FlChart2dMultiSerie} from '../model/data/fl-chart-multi-serie.class';
import {FlChartScaleColor} from '../model/scale/fl-chart-scale-color.class';

export class FlChartRendererScatterPlot implements FlChart2dRenderer<FlChart2dMultiSerie<FlChart2dDatum>> {

  private portalHandler: FlChartDataWithSeriePortalHandler = new FlChartDataWithSeriePortalHandler();

  constructor(public colorScale: FlChartScaleColor) {
  }

  initData(input: FlChart2dRendererInput<FlChart2dMultiSerie<FlChart2dDatum>>): void {
    // Add dots
    input.container
      // generate groups for the series
      .selectAll()
      .data(input.data.series)
      .enter()
      .append('g')

      // for each group, generate the circle
      .selectAll()
      .data((d) => d.getDataWithSerie())
      .enter()
      .append('circle')
      .attr('r', 3)
      .style('fill', (d: FlChartDataWithSerie<FlChart2dDatum>) => this.colorScale.scale(d.serieKey))
      .attr('cx', (d: FlChartDataWithSerie<FlChart2dDatum>) => input.xScale.scale(d.data.getX()))
      .attr('cy', (d: FlChartDataWithSerie<FlChart2dDatum>) => input.yScale.scale(d.data.getY()))
      .on('mouseover', (event, d) => this.onMouseHover(event, d))
      .on('mouseout', () => this.onMouseOut());
  }

  refreshData(input: FlChart2dRendererInput<FlChart2dMultiSerie<FlChart2dDatum>>): void {
    input.container
      .selectAll(`circle`)
      .transition()
      .attr('cx', (d: FlChartDataWithSerie<FlChart2dDatum>) => input.xScale.scale(d.data.getX()))
      .attr('cy', (d: FlChartDataWithSerie<FlChart2dDatum>) => input.yScale.scale(d.data.getY()));
  }

  private onMouseHover(event: MouseEvent, d: FlChartDataWithSerie<FlChart2dDatum>): void {
    this.portalHandler.openPortal(event.target as any, d, this.colorScale);
  }

  private onMouseOut(): void {
    this.portalHandler.closePortal();
  }

}
