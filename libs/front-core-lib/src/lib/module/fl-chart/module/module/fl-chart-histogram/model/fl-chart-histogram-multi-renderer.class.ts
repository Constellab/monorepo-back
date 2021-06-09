import {FlChart2dRendererInput, FlChart2dRendererMultiple} from '../../../../model/fl-chart-2d-renderer.class';
import {Numeric, select} from 'd3';
import {FlChart2dMultipleSerie, FlChartDataWithSerie} from '../../../../model/fl-chart-2d-serie.class';
import {FlChart2dDatum} from '../../../../model/fl-chart-2d-data.class';
import {FlChartAxisScale, FlChartAxisScaleBand} from '../../../../model/fl-chart-scale.class';
import {FlChartDataWithSeriePortalHandler} from '../../../../model/fl-chart-data-with-serie-portal-handler.class';


export class FlChartHistogramMultiRenderer
  extends FlChart2dRendererMultiple<FlChart2dMultipleSerie<FlChart2dDatum>> {

  private readonly groupClassName: string = 'serie';

  private portalHandler: FlChartDataWithSeriePortalHandler = new FlChartDataWithSeriePortalHandler();

  initData(input: FlChart2dRendererInput<FlChart2dMultipleSerie<FlChart2dDatum>>): void {

    const data: FlChartDataWithSerie[][] = input.data.invert();

    input.container
      // generate a group for each serie
      .selectAll()
      .data(data)
      .enter()
      .append('g')
      .attr('class', this.groupClassName)  // I add the class line to be able to modify this line later on.
      .attr('transform', (d, index) => this.getGroupTranslate(input.xScale, input.chartWidth, index))

      // for each group generate the values
      .each((data, index, nodes) =>
        this.drawSerie(nodes[index], data, (input.xScale as unknown as FlChartAxisScaleBand).bandwidth(), input));
  }

  private drawSerie(group: SVGElement, data: FlChartDataWithSerie[],
                    groupWidth: number, input: FlChart2dRendererInput<FlChart2dMultipleSerie<FlChart2dDatum>>): void {

    const barWidth: number = groupWidth / data.length;

    select(group).selectAll()
      .data(data)
      .enter()
      .append('rect')
      .on('mouseover', (event, d) => this.onMouseHover(event, d))
      .on('mouseout', () => this.onMouseOut())
      .style('fill', (d) => this.colorScale.scale(d.serieKey))
      .each((d, index, nodes: SVGRectElement[]) =>
        this.drawBar(nodes[index], barWidth, input.chartHeight, input.yScale, index));
  }

  refreshData(input: FlChart2dRendererInput<FlChart2dMultipleSerie<FlChart2dDatum>>): void {
    input.container
      // generate a group for each serie
      .selectAll(`.${this.groupClassName}`)
      .attr('transform', (d, index) => this.getGroupTranslate(input.xScale, input.chartWidth, index))
      // for each group generate the values
      .each((data: FlChartDataWithSerie[], index, nodes: SVGElement[]) =>
        this.refreshSerie(nodes[index], data, (input.xScale as unknown as FlChartAxisScaleBand).bandwidth(), input));
  }

  private refreshSerie(group: SVGElement, data: FlChartDataWithSerie[],
                       groupWidth: number, input: FlChart2dRendererInput<FlChart2dMultipleSerie<FlChart2dDatum>>): void {

    const barWidth: number = groupWidth / data.length;

    select(group)
      .selectAll('rect')
      .each((d, index, nodes: SVGRectElement[]) =>
        this.drawBar(nodes[index], barWidth, input.chartHeight, input.yScale, index));
  }

  // return the position of the group
  private getGroupTranslate(xScale: FlChartAxisScale<Numeric>, chartWidth: number, index: number): string {
    // if the scale return null set the the group outside chart
    return 'translate(' + (xScale.scale(index) == null ? chartWidth : xScale.scale(index)) + ',0)';
  }

  // draw one bar
  private drawBar(element: SVGRectElement, barWidth: number, chartHeight: number,
                  yScale: FlChartAxisScale<Numeric>, index: number): void {
    select(element)
      .attr('transform',
        (d: FlChartDataWithSerie) => 'translate(' + barWidth * index + ',' + yScale.scale(d.data.getY()) + ')'
      )
      .attr('width', barWidth - 1) // - 1 to let space between bars
      .attr('height', (d: FlChartDataWithSerie) => chartHeight - yScale.scale(d.data.getY()));
  }

  private onMouseHover(event: MouseEvent, d: FlChartDataWithSerie): void {
    this.portalHandler.openPortal(event.target as any, d, this.colorScale);
  }

  private onMouseOut(): void {
    this.portalHandler.closePortal();
  }


}
