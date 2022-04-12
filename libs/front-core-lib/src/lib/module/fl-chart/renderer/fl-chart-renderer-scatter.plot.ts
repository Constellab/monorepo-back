import {FlChart2dDatum} from '../model/data/fl-chart-data.class';
import {FlChart2AxisRenderer} from './fl-chart-renderer.class';
import {FlChartDataWithSerie} from '../model/data/fl-chart-serie.class';
import {FlChartDataWithSeriePortalHandler} from '../model/portal-handler/fl-chart-data-with-serie-portal-handler.class';
import {FlChart2dMultiSerie} from '../model/data/fl-chart-multi-serie.class';
import {FlChartScaleColor} from '../model/scale/fl-chart-scale-color.class';

export class FlChartRendererScatterPlot extends FlChart2AxisRenderer<FlChart2dMultiSerie<FlChart2dDatum>> {

  private portalHandler: FlChartDataWithSeriePortalHandler = new FlChartDataWithSeriePortalHandler();

  constructor(public colorScale: FlChartScaleColor) {
    super();
  }

  renderFirst(): void {
    // Add dots
    this.data.container
      // generate groups for the series
      .selectAll()
      .data(this.data.data.series)
      .enter()
      .append('g')

      // for each group, generate the circle
      .selectAll()
      .data((d) => d.getDataWithSerie(true))
      .enter()
      .append('circle')
      .attr('r', 3)
      .style('fill', (d: FlChartDataWithSerie<FlChart2dDatum>) => this.colorScale.getColor(d.serieKey))
      .attr('cx', (d: FlChartDataWithSerie<FlChart2dDatum>) => this.data.xScale.getColor(d.data.getX()))
      .attr('cy', (d: FlChartDataWithSerie<FlChart2dDatum>) => this.data.yScale.getColor(d.data.getY()))
      .on('mouseover', (event, d) => this.onMouseHover(event, d))
      .on('mouseout', () => this.onMouseOut());
  }

  refreshRender(): void {
    this.data.container
      .selectAll(`circle`)
      .transition()
      .attr('cx', (d: FlChartDataWithSerie<FlChart2dDatum>) => this.data.xScale.getColor(d.data.getX()))
      .attr('cy', (d: FlChartDataWithSerie<FlChart2dDatum>) => this.data.yScale.getColor(d.data.getY()));
  }

  setTagColors(colorScale: FlChartScaleColor): void {
    this.data.container
      .selectAll(`circle`)
      .style('fill', (d: FlChartDataWithSerie<FlChart2dDatum>) => colorScale.getColor(d.data.tags));
  }

  resetColors(): void {
    this.data.container
      .selectAll(`circle`)
      .style('fill', (d: FlChartDataWithSerie<FlChart2dDatum>) => this.colorScale.getColor(d.serieKey));
  }

  private onMouseHover(event: MouseEvent, d: FlChartDataWithSerie<FlChart2dDatum>): void {
    this.portalHandler.openPortal(event.target as any, d, this.colorScale);
  }

  private onMouseOut(): void {
    this.portalHandler.closePortal();
  }

}
