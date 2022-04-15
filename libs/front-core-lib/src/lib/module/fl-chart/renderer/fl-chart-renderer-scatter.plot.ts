import {FlChart2dDatum} from '../model/data/fl-chart-data.class';
import {FlChart2AxisRenderer} from './fl-chart-renderer.class';
import {FlChartDataWithSerie} from '../model/data/fl-chart-serie.class';
import {FlChartDataWithSeriePortalHandler} from '../model/portal-handler/fl-chart-data-with-serie-portal-handler.class';
import {FlChart2dMultiSerie} from '../model/data/fl-chart-multi-serie.class';
import {FlChartScaleColor} from '../model/scale/fl-chart-scale-color.class';

export class FlChartRendererScatterPlot extends FlChart2AxisRenderer<FlChart2dMultiSerie<FlChart2dDatum>> {

  private portalHandler: FlChartDataWithSeriePortalHandler = new FlChartDataWithSeriePortalHandler();

  // function to return the color of the point
  private getColorFunction: (d: FlChartDataWithSerie<FlChart2dDatum>) => string;

  constructor(private defaultColorScale: FlChartScaleColor) {
    super();
    this.getColorFunction = this.getDefaultColorFunction();
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
      .style('fill', (d: FlChartDataWithSerie<FlChart2dDatum>) => this.getColorFunction(d))
      .attr('cx', (d: FlChartDataWithSerie<FlChart2dDatum>) => this.data.xScale.scale(d.data.getX()))
      .attr('cy', (d: FlChartDataWithSerie<FlChart2dDatum>) => this.data.yScale.scale(d.data.getY()))
      .on('mouseover', (event, d) => this.onMouseHover(event, d))
      .on('mouseout', () => this.onMouseOut());
  }

  refreshRender(): void {
    this.data.container
      .selectAll(`circle`)
      .transition()
      .attr('cx', (d: FlChartDataWithSerie<FlChart2dDatum>) => this.data.xScale.scale(d.data.getX()))
      .attr('cy', (d: FlChartDataWithSerie<FlChart2dDatum>) => this.data.yScale.scale(d.data.getY()));
  }

  // set function to return color of points based on tags
  setTagColors(colorScale: FlChartScaleColor): void {
    this.setColorFunction((d: FlChartDataWithSerie<FlChart2dDatum>) => colorScale.scale(d.data.tags));
  }

  resetColors(): void {
    this.setColorFunction(this.getDefaultColorFunction());
  }

  private setColorFunction(colorFunction: (d: FlChartDataWithSerie<FlChart2dDatum>) => string): void {
    this.getColorFunction = colorFunction;
    this.data.container
      .selectAll(`circle`)
      .style('fill', (d: FlChartDataWithSerie<FlChart2dDatum>) => this.getColorFunction(d));
  }

  private getDefaultColorFunction(): (d: FlChartDataWithSerie<FlChart2dDatum>) => string {
    return (d: FlChartDataWithSerie<FlChart2dDatum>) => this.defaultColorScale.scale(d.serieKey);
  }

  private onMouseHover(event: MouseEvent, d: FlChartDataWithSerie<FlChart2dDatum>): void {
    this.portalHandler.openPortal(event.target as any, d, this.defaultColorScale);
  }

  private onMouseOut(): void {
    this.portalHandler.closePortal();
  }

}
