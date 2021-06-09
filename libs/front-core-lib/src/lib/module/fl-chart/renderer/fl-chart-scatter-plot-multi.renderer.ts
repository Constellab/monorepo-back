import {FlChart2dDatum} from '../model/fl-chart-2d-data.class';
import {FlChart2dRendererInput, FlChart2dRendererMultiple} from '../model/fl-chart-2d-renderer.class';
import {FlChart2dMultipleSerie, FlChartDataWithSerie} from '../model/fl-chart-2d-serie.class';
import {FlChartDataWithSeriePortalHandler} from '../model/fl-chart-data-with-serie-portal-handler.class';

export class FlChartScatterPlotMultiRenderer
  extends FlChart2dRendererMultiple<FlChart2dMultipleSerie<FlChart2dDatum>> {

  private portalHandler: FlChartDataWithSeriePortalHandler = new FlChartDataWithSeriePortalHandler();

  initData(input: FlChart2dRendererInput<FlChart2dMultipleSerie<FlChart2dDatum>>): void {
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
      .style('fill', (d: FlChartDataWithSerie) => this.colorScale.scale(d.serieKey))
      .attr('cx', (d: FlChartDataWithSerie) => input.xScale.scale(d.data.getX()))
      .attr('cy', (d: FlChartDataWithSerie) => input.yScale.scale(d.data.getY()))
      .on('mouseover', (event, d) => this.onMouseHover(event, d))
      .on('mouseout', () => this.onMouseOut());
  }

  refreshData(input: FlChart2dRendererInput<FlChart2dMultipleSerie<FlChart2dDatum>>): void {
    input.container
      .selectAll(`circle`)
      .transition()
      .attr('cx', (d: FlChartDataWithSerie) => input.xScale.scale(d.data.getX()))
      .attr('cy', (d: FlChartDataWithSerie) => input.yScale.scale(d.data.getY()));
  }

  private onMouseHover(event: MouseEvent, d: FlChartDataWithSerie): void {
    this.portalHandler.openPortal(event.target as any, d, this.colorScale);
  }

  private onMouseOut(): void {
    this.portalHandler.closePortal();
  }

}
