import {FlChart2dRenderer, FlChart2dRendererInput} from '../model/fl-chart-2d-renderer.class';
import {Numeric, select} from 'd3';
import {FlChartSerie} from '../model/data/fl-chart-serie.class';
import {FlChartAxisScale, FlChartAxisScaleBand} from '../model/fl-chart-scale.class';
import {FlThemeDetail} from '../../../service/model/fl-theme-detail.class';
import {flRootInjector} from '../../../utils/fl-root-injector';
import {FlThemeService} from '../../../service/fl-theme.service';
import {FlChartBoxPlotData, FlChartBoxPlotSerie} from '../model/data/fl-chart-box-plot-data.class';
import {FlChartPortalHandler} from '../model/portal-handler/fl-chart-portal-handler.class';
import {
  FlChartBoxPlotDataPortalComponent,
  FlChartBoxPlotDataPortalInput
} from '../component/fl-chart-box-plot-data-portal/fl-chart-box-plot-data-portal.component';
import {FlChartMultiSerie} from '../model/data/fl-chart-multi-serie.class';
import {FlChartScaleColor} from '../model/fl-chart-scale-color.class';


export class FlChartBoxPlotMultiRenderer
  implements FlChart2dRenderer<FlChartMultiSerie<number>> {

  private readonly groupClassName: string = 'serie';
  private readonly verticalLineClassName: string = 'vertical-line';
  private readonly horizontalLineClassName: string = 'horizontal-line';

  private portalHandler: FlChartPortalHandler = new FlChartPortalHandler();

  private theme: FlThemeDetail;

  constructor(public colorScale: FlChartScaleColor) {
  }

  initData(input: FlChart2dRendererInput<FlChartMultiSerie<number>>): void {
    this.initTheme();

    input.container
      // generate a group for each serie
      .selectAll()
      .data(input.data.series as FlChartBoxPlotSerie[])
      .enter()
      .append('g')
      .attr('class', this.groupClassName)  // I add the class line to be able to modify this line later on.
      .attr('transform', (d) => this.getGroupTranslate(input.xScale, input.chartWidth, d.key))
      .on('mouseover', (event, d) => this.onMouseHover(event, d))
      .on('mouseout', () => this.onMouseOut())

      // for each group generate the values
      .each((data, index, nodes) =>
        this.drawSerie(nodes[index], data, (input.xScale as unknown as FlChartAxisScaleBand).bandwidth(), input));
  }

  private drawSerie(group: SVGElement, serie: FlChartSerie<number>,
                    groupWidth: number, input: FlChart2dRendererInput<FlChartMultiSerie<number>>): void {
    // Show the main vertical line
    select(group)
      .append('line')
      .attr('class', this.verticalLineClassName);

    // Show the box
    select(group)
      .append('rect');

    // create the 3 lines for median min and max horizontal lines
    select(group).append('line').attr('class', this.horizontalLineClassName);
    select(group).append('line').attr('class', this.horizontalLineClassName);
    select(group).append('line').attr('class', this.horizontalLineClassName);

    // draw the plot with the data
    this.drawBoxPlot(group, serie as FlChartBoxPlotSerie, groupWidth, input);
  }

  refreshData(input: FlChart2dRendererInput<FlChartMultiSerie<number>>): void {
    input.container
      // generate a group for each serie
      .selectAll(`.${this.groupClassName}`)
      .attr('transform', ((d: FlChartSerie<number>) => this.getGroupTranslate(input.xScale, input.chartWidth, d.key)))
      // for each group generate the values
      .each((data: FlChartSerie<number>, index, nodes: SVGElement[]) =>
        this.drawBoxPlot(nodes[index], data as FlChartBoxPlotSerie, (input.xScale as unknown as FlChartAxisScaleBand).bandwidth(), input));
  }

  private drawBoxPlot(group: SVGElement, serie: FlChartBoxPlotSerie,
                      groupWidth: number, input: FlChart2dRendererInput<FlChartMultiSerie<number>>): void {
    const boxData: FlChartBoxPlotData = serie.boxPlotData;

    const xCenter = groupWidth / 2;

    // Show the main vertical line
    select(group)
      .selectAll(`.${this.verticalLineClassName}`)
      .attr('x1', xCenter)
      .attr('x2', xCenter)
      .attr('y1', input.yScale.scale(boxData.lowerWhisker))
      .attr('y2', input.yScale.scale(boxData.upperWhisker))
      .attr('stroke', this.theme.foreground);

    // Show the box
    select(group)
      .selectAll(`rect`)
      .attr('x', xCenter - groupWidth / 2)
      .attr('y', input.yScale.scale(boxData.q3))
      .attr('height', (input.yScale.scale(boxData.q1) - input.yScale.scale(boxData.q3)))
      .attr('width', groupWidth)
      .attr('stroke', this.theme.foreground)
      .style('fill', () => this.colorScale.scale(serie.key));

    // show median, min and max horizontal lines
    select(group)
      .selectAll(`.${this.horizontalLineClassName}`)
      .data([boxData.lowerWhisker, boxData.median, boxData.upperWhisker])
      .attr('x1', xCenter - groupWidth / 2)
      .attr('x2', xCenter + groupWidth / 2)
      .attr('y1', (d) => input.yScale.scale(d))
      .attr('y2', (d) => input.yScale.scale(d))
      .attr('stroke', this.theme.foreground);
  }

  // return the position of the group
  private getGroupTranslate(xScale: FlChartAxisScale<Numeric>, chartWidth: number, serieKey: number): string {
    // if the scale return null set the the group outside chart
    return 'translate(' + (xScale.scale(serieKey) == null ? (chartWidth + 10) : xScale.scale(serieKey)) + ',0)';
  }

  private initTheme(): void {
    this.theme = flRootInjector.get(FlThemeService).getCurrentThemeDetail();
  }

  private onMouseHover(event: MouseEvent, serie: FlChartBoxPlotSerie): void {
    const data: FlChartBoxPlotDataPortalInput = {
      serie: serie,
      seriesColorScale: this.colorScale
    };
    this.portalHandler.openPortal(event.target as any, FlChartBoxPlotDataPortalComponent, data);
  }

  private onMouseOut(): void {
    this.portalHandler.closePortal();
  }


}
