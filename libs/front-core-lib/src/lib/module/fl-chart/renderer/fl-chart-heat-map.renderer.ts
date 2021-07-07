import {FlChart2dRenderer, FlChart2dRendererInput} from '../model/fl-chart-2d-renderer.class';
import {FlChartMultiSerie} from '../model/data/fl-chart-multi-serie.class';
import {FlChartAxisScaleBand} from '../model/fl-chart-scale.class';
import {FlChart3dDatum} from '../model/data/fl-chart-data.class';
import {FlChartPortalHandler} from '../model/portal-handler/fl-chart-portal-handler.class';
import {FlChartHeatMapDataPortalComponent} from '../component/fl-chart-heat-map-data-portal/fl-chart-heat-map-data-portal.component';
import {FlChartScaleColor} from '../model/fl-chart-scale-color.class';

export class FlChartHeatMapRenderer
  implements FlChart2dRenderer<FlChartMultiSerie<FlChart3dDatum>> {

  private portalHandler: FlChartPortalHandler = new FlChartPortalHandler();

  constructor(private colorScale: FlChartScaleColor) {
  }

  initData(input: FlChart2dRendererInput<FlChartMultiSerie<FlChart3dDatum>>): void {
    const data: FlChart3dDatum[] = input.data.getData();
    const xScale: FlChartAxisScaleBand = input.xScale as FlChartAxisScaleBand;
    const yScale: FlChartAxisScaleBand = input.yScale as FlChartAxisScaleBand;


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
