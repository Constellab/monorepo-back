import {FlChart2AxisRenderer} from './fl-chart-renderer.class';
import {FlChartScaleBand} from '../model/scale/fl-chart-scale.class';
import {FlChart3dDatum} from '../model/data/fl-chart-data.class';
import {FlChartPortalHandler} from '../model/portal-handler/fl-chart-portal-handler.class';
import {
  FlChartHeatMapDataPortalComponent
} from '../component/fl-chart-data-portal/fl-chart-heat-map-data-portal/fl-chart-heat-map-data-portal.component';
import {FlChartScaleColor} from '../model/scale/fl-chart-scale-color.class';
import {FlChartHeatMapDataContainer} from '../model/chart/fl-chart-heat-map.class';

export class FlChartRendererHeatMap extends FlChart2AxisRenderer<FlChartHeatMapDataContainer> {

  private portalHandler: FlChartPortalHandler = new FlChartPortalHandler();

  constructor(private colorScale: FlChartScaleColor) {
    super();
  }

  renderFirst(): void {
    const data: FlChart3dDatum[] = this.data.data.getData();
    const xScale: FlChartScaleBand = this.data.xScale as FlChartScaleBand;
    const yScale: FlChartScaleBand = this.data.yScale as FlChartScaleBand;

    this.data.container.selectAll()
      .data(data)
      .enter()
      .append('rect')
      .on('mouseover', (event, d) => this.onMouseHover(event, d))
      .on('mouseout', () => this.onMouseOut())
      .attr('x', ((d: FlChart3dDatum) => xScale.scale(d.getX())))
      .attr('y', d => yScale.scale(d.getY()))
      .attr('width', xScale.bandwidth())
      .attr('height', yScale.bandwidth())
      .style('fill', (d) => d.getZ() ? this.colorScale.scale(d.getZ().valueOf()) : null);
  }

  refreshRender(): void {
    throw new Error('Refresh not supported in Heat map');
  }

  private onMouseHover(event: MouseEvent, d: FlChart3dDatum): void {

    // create the portal
    this.portalHandler.openPortal(event.target as any, FlChartHeatMapDataPortalComponent, d);
  }

  private onMouseOut(): void {
    this.portalHandler.closePortal();
  }

}
