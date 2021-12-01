import {FlChart2AxisRenderer, FlChart2AxisRendererInput} from './fl-chart-renderer.class';
import {FlChartMultiSerie} from '../model/data/fl-chart-multi-serie.class';
import {FlChartScaleBand} from '../model/scale/fl-chart-scale.class';
import {FlChart3dDatum} from '../model/data/fl-chart-data.class';
import {FlChartPortalHandler} from '../model/portal-handler/fl-chart-portal-handler.class';
import {FlChartHeatMapDataPortalComponent} from '../component/fl-chart-heat-map-data-portal/fl-chart-heat-map-data-portal.component';
import {FlChartScaleColor} from '../model/scale/fl-chart-scale-color.class';

export class FlChartRendererHeatMap implements FlChart2AxisRenderer<FlChartMultiSerie<FlChart3dDatum>> {

  private portalHandler: FlChartPortalHandler = new FlChartPortalHandler();

  constructor(private colorScale: FlChartScaleColor) {
  }

  initData(input: FlChart2AxisRendererInput<FlChartMultiSerie<FlChart3dDatum>>): void {
    const data: FlChart3dDatum[] = input.data.getData();
    const xScale: FlChartScaleBand = input.xScale as FlChartScaleBand;
    const yScale: FlChartScaleBand = input.yScale as FlChartScaleBand;


    input.container.selectAll()
      .data(data)
      .enter()
      .append('rect')
      .on('mouseover', (event, d) => this.onMouseHover(event, d))
      .on('mouseout', () => this.onMouseOut())
      .attr('x', ((d: FlChart3dDatum) => xScale.scale(d.getX())))
      .attr('y', d => yScale.scale(d.getY()))
      .attr('width', xScale.bandwidth())
      .attr('height', yScale.bandwidth())
      .style('fill', (d) => this.colorScale.scale(d.getZ()?.valueOf() ?? null));
  }

  refreshData(): void {
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
