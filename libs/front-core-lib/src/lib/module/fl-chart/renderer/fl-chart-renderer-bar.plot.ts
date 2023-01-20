import {FlChart2AxisRenderer} from './fl-chart-renderer.class';
import {select} from 'd3';
import {FlChartDataWithSerie} from '../model/data/fl-chart-serie.class';
import {FlChart2dDatum} from '../model/data/fl-chart-data.class';
import {FlChartScale, FlChartScaleBand} from '../model/scale/fl-chart-scale.class';
import {FlChart2dMultiSerie} from '../model/data/fl-chart-multi-serie.class';
import {FlChartDataBin} from '../model/data/fl-chart-data-bin.class';
import {
  FlChartBinDataPortalComponent,
  FlChartBinDataPortalInput
} from '../component/fl-chart-data-portal/fl-chart-bin-data-portal/fl-chart-bin-data-portal.component';
import {FlChartScaleColor} from '../model/scale/fl-chart-scale-color.class';
import {FlChartPortalHandler} from '../model/portal-handler/fl-chart-portal-handler.class';
import {
  FlChartDataWithSeriePortalInput
} from '../component/fl-chart-data-portal/fl-chart-data-with-serie-portal/fl-chart-data-with-serie-portal.component';


/**
 * Renderer for bar plot or histogram
 */
export class FlChartRendererBarPlot extends FlChart2AxisRenderer<FlChart2dMultiSerie<FlChart2dDatum>> {

  private readonly groupClassName: string = 'serie';

  private portalHandler: FlChartPortalHandler = new FlChartPortalHandler();

  constructor(private colorScale: FlChartScaleColor) {
    super();
  }

  renderFirst(): void {
    this.refreshRender();
  }


  refreshRender(): void {
    const chartData: FlChartDataWithSerie<FlChart2dDatum>[][] = this.data.data.groupByX();

    this.data.container
      // generate a group for each serie
      .selectAll(`.${this.groupClassName}`)
      .data(chartData)
      .join('g')
      .attr('class', this.groupClassName)  // I add the class line to be able to modify this line later on.
      .attr('transform', (d) =>
        this.getGroupTranslate(this.data.xAxis.scale, this.data.chartWidth, d))

      // for each group generate the values
      .each((data, index, nodes) =>
        this.drawSerie(nodes[index] as any, data, (this.data.xAxis.scale as FlChartScaleBand).bandwidth()));
  }

  private drawSerie(group: SVGElement, chartData: FlChartDataWithSerie<FlChart2dDatum>[],
                    groupWidth: number): void {

    const barWidth: number = groupWidth / chartData.length;

    select(group).selectAll('rect')
      .data(chartData)
      .join('rect')
      .on('mouseover', (event, d) => this.openPortal(event, d, false))
      .on('mouseout', () => this.closePortal())
      .on('click', (event, d) => this.openPortal(event, d, true))
      .style('fill', (d) => this.colorScale.scale(d.serieKey))
      .each((d, index, nodes: SVGRectElement[]) =>
        this.drawBar(d, nodes[index], barWidth, this.data.yAxis.scale, index));
  }


  // return the position of the group
  private getGroupTranslate(xScale: FlChartScale, chartWidth: number, d: FlChartDataWithSerie<FlChart2dDatum>[]): string {
    // get the x value (each series have the same x) and scale it
    const x = xScale.scale(d[0].data.getX());
    // if the scale return null set the group outside chart
    return 'translate(' + (x == null ? (chartWidth + 10) : x) + ',0)';
  }

  // draw one bar
  private drawBar(d: FlChartDataWithSerie<FlChart2dDatum>, element: SVGRectElement, barWidth: number,
                  yScale: FlChartScale, index: number): void {
    if (d.data == null) {
      return;
    }

    // prevent bar width from being smaller than 1
    barWidth = Math.max(barWidth, 1);

    const y0 = yScale.scale(0);

    select(element)
      .attr('transform',
        (d: FlChartDataWithSerie<FlChart2dDatum>) => this.getTransform(d, barWidth, yScale, index, y0)
      )
      .attr('width', barWidth - 0.5) // - 1 to let space between bars
      // set height, equals to distance from 0
      .attr('height', (d: FlChartDataWithSerie<FlChart2dDatum>) => Math.abs(yScale.scale(d.data.getY(0)) - y0));
  }

  private getTransform(d: FlChartDataWithSerie<FlChart2dDatum>, barWidth: number,
                       yScale: FlChartScale, index: number, y0: number): string {
    const value = d.data.getY(0);

    let y: number;
    if (value >= 0) {
      y = yScale.scale(value);
    } else {
      // if negative, the base is 0
      y = y0;
    }

    return `translate(${barWidth * index},${y})`;
  }


  private openPortal(event: MouseEvent, d: FlChartDataWithSerie<FlChart2dDatum>, fixPortal: boolean): void {
    // handle the FlChartDataBin portal
    if (d.data instanceof FlChartDataBin) {
      const data: FlChartBinDataPortalInput = {
        data: d as any,
        color: this.colorScale.scale(d.serieKey)
      };
      // create the portal
      this.portalHandler.openPortal(event.target as any, FlChartBinDataPortalComponent, data, fixPortal);

      // basic portal
    } else {
      const data: FlChartDataWithSeriePortalInput = {
        data: d,
        color: this.colorScale.scale(d.serieKey),
        xLabelFormatter: this.data.xAxis.getTickFormatter(),
        yLabelFormatter: this.data.yAxis.getTickFormatter(),
      };
      // create the portal
      this.portalHandler.openDataWithSeriePortal(event.target as any, data, fixPortal);
    }
  }


  private closePortal(): void {
    this.portalHandler.closePortal();
  }
}
