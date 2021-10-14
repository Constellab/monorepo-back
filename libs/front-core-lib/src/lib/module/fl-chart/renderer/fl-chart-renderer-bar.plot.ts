import {FlChart2dRenderer, FlChart2dRendererInput} from './fl-chart-2d-renderer.class';
import {Numeric, select} from 'd3';
import {FlChartDataWithSerie} from '../model/data/fl-chart-serie.class';
import {FlChart2dDatum} from '../model/data/fl-chart-data.class';
import {FlChartScale, FlChartScaleBand} from '../model/scale/fl-chart-scale.class';
import {FlChart2dMultiSerie} from '../model/data/fl-chart-multi-serie.class';
import {FlChartDataBin} from '../model/data/fl-chart-data-bin.class';
import {FlChartPortalHandler} from '../model/portal-handler/fl-chart-portal-handler.class';
import {
  FlChartDataWithSeriePortalComponent,
  FlChartDataWithSeriePortalInput
} from '../component/fl-chart-data-with-serie-portal/fl-chart-data-with-serie-portal.component';
import {
  FlChartBinDataPortalComponent,
  FlChartBinDataPortalInput
} from '../component/fl-chart-bin-data-portal/fl-chart-bin-data-portal.component';
import {FlChartScaleColor} from '../model/scale/fl-chart-scale-color.class';


/**
 * Renderer for bar plot or histogram
 */
export class FlChartRendererBarPlot implements FlChart2dRenderer<FlChart2dMultiSerie<FlChart2dDatum>> {

  private readonly groupClassName: string = 'serie';

  private portalHandler: FlChartPortalHandler = new FlChartPortalHandler();

  constructor(public colorScale: FlChartScaleColor) {
  }

  initData(input: FlChart2dRendererInput<FlChart2dMultiSerie<FlChart2dDatum>>): void {

    const data: FlChartDataWithSerie<FlChart2dDatum>[][] = input.data.invert();

    input.container
      // generate a group for each serie
      .selectAll()
      .data(data)
      .enter()
      .append('g')
      .attr('class', this.groupClassName)  // I add the class line to be able to modify this line later on.
      .attr('transform', (d) =>
        this.getGroupTranslate(input.xScale, input.chartWidth, d))

      // for each group generate the values
      .each((data, index, nodes) =>
        this.drawSerie(nodes[index], data, (input.xScale as unknown as FlChartScaleBand).bandwidth(), input));
  }

  private drawSerie(group: SVGElement, data: FlChartDataWithSerie<FlChart2dDatum>[],
                    groupWidth: number, input: FlChart2dRendererInput<FlChart2dMultiSerie<FlChart2dDatum>>): void {

    const barWidth: number = groupWidth / data.length;

    select(group).selectAll()
      .data(data)
      .enter()
      .append('rect')
      .on('mouseover', (event, d) => this.onMouseHover(event, d))
      .on('mouseout', () => this.onMouseOut())
      .style('fill', (d) => this.colorScale.scale(d.serieKey))
      .each((d, index, nodes: SVGRectElement[]) =>
        this.drawBar(d, nodes[index], barWidth, input.chartHeight, input.yScale, index));
  }

  refreshData(input: FlChart2dRendererInput<FlChart2dMultiSerie<FlChart2dDatum>>): void {
    input.container
      // generate a group for each serie
      .selectAll(`.${this.groupClassName}`)
      .attr('transform', (d: FlChartDataWithSerie<FlChart2dDatum>[]) =>
        this.getGroupTranslate(input.xScale, input.chartWidth, d))
      // for each group generate the values
      .each((data: FlChartDataWithSerie<FlChart2dDatum>[], index, nodes: SVGElement[]) =>
        this.refreshSerie(nodes[index], data, (input.xScale as unknown as FlChartScaleBand).bandwidth(), input));
  }

  private refreshSerie(group: SVGElement, data: FlChartDataWithSerie<FlChart2dDatum>[],
                       groupWidth: number, input: FlChart2dRendererInput<FlChart2dMultiSerie<FlChart2dDatum>>): void {

    const barWidth: number = groupWidth / data.length;

    select(group)
      .selectAll('rect')
      .each((d: FlChartDataWithSerie<FlChart2dDatum>, index, nodes: SVGRectElement[]) =>
        this.drawBar(d, nodes[index], barWidth, input.chartHeight, input.yScale, index));
  }

  // return the position of the group
  private getGroupTranslate(xScale: FlChartScale<Numeric>, chartWidth: number, d: FlChartDataWithSerie<FlChart2dDatum>[]): string {
    // get the x value (each series have the same x) and scale it
    const x = xScale.scale(d[0].data.getX());
    // if the scale return null set the the group outside chart
    return 'translate(' + (x == null ? (chartWidth + 10) : x) + ',0)';
  }

  // draw one bar
  private drawBar(d: FlChartDataWithSerie<FlChart2dDatum>, element: SVGRectElement, barWidth: number, chartHeight: number,
                  yScale: FlChartScale<Numeric>, index: number): void {
    if (d.data == null) {
      return;
    }

    // prevent bar width form being smaller than 1
    barWidth = Math.max(barWidth, 1);

    select(element)
      .attr('transform',
        (d: FlChartDataWithSerie<FlChart2dDatum>) => 'translate(' + barWidth * index + ',' + yScale.scale(d.data.getY()) + ')'
      )
      .attr('width', barWidth - 0.5) // - 1 to let space between bars
      .attr('height', (d: FlChartDataWithSerie<FlChart2dDatum>) => chartHeight - yScale.scale(d.data.getY()));
  }

  private onMouseHover(event: MouseEvent, d: FlChartDataWithSerie<FlChart2dDatum>): void {
    // handle the FlChartDataBin portal
    if (d.data instanceof FlChartDataBin) {
      const data: FlChartBinDataPortalInput = {
        data: d as any,
        seriesColorScale: this.colorScale
      };
      // create the portal
      this.portalHandler.openPortal(event.target as any, FlChartBinDataPortalComponent, data);

      // basic portal
    } else {
      const data: FlChartDataWithSeriePortalInput = {
        data: d,
        seriesColorScale: this.colorScale
      };
      // create the portal
      this.portalHandler.openPortal(event.target as any, FlChartDataWithSeriePortalComponent, data);
    }
  }

  private onMouseOut(): void {
    this.portalHandler.closePortal();
  }


}
