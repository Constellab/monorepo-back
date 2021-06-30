import {FlChart2dRendererInput, FlChart2dRendererMultiple} from '../model/fl-chart-2d-renderer.class';
import {Numeric, select} from 'd3';
import {FlChart2dSerie} from '../model/fl-chart-2d-serie.class';
import {FlChart2dDatum} from '../model/fl-chart-2d-data.class';
import {FlChartAxisScale, FlChartAxisScaleBand} from '../model/fl-chart-scale.class';
import {FlThemeDetail} from '../../../service/model/fl-theme-detail.class';
import {flRootInjector} from '../../../utils/fl-root-injector';
import {FlThemeService} from '../../../service/fl-theme.service';
import {FlChartBoxPlotData, flChartGetBoxPlotData} from '../model/fl-chart-box-plot-data.class';
import {FlChartPortalHandler} from '../model/portal-handler/fl-chart-portal-handler.class';
import {
  FlChartBoxPlotDataPortalComponent,
  FlChartBoxPlotDataPortalInput
} from '../module/module/fl-chart-core/component/fl-chart-box-plot-data-portal/fl-chart-box-plot-data-portal.component';
import {FlChart2dMultiSerie} from '../model/fl-chart-2d-multi-serie.class';


export class FlChartBoxPlotMultiRenderer
  extends FlChart2dRendererMultiple<FlChart2dMultiSerie<FlChart2dDatum>> {

  private readonly groupClassName: string = 'serie';
  private readonly verticalLineClassName: string = 'vertical-line';
  private readonly horizontalLineClassName: string = 'horizontal-line';

  private portalHandler: FlChartPortalHandler = new FlChartPortalHandler();

  private theme: FlThemeDetail;

  initData(input: FlChart2dRendererInput<FlChart2dMultiSerie<FlChart2dDatum>>): void {
    this.initTheme();

    input.container
      // generate a group for each serie
      .selectAll()
      .data(input.data.series)
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

  private drawSerie(group: SVGElement, serie: FlChart2dSerie<FlChart2dDatum>,
                    groupWidth: number, input: FlChart2dRendererInput<FlChart2dMultiSerie<FlChart2dDatum>>): void {
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
    this.drawBoxPlot(group, serie, groupWidth, input);
  }

  refreshData(input: FlChart2dRendererInput<FlChart2dMultiSerie<FlChart2dDatum>>): void {
    input.container
      // generate a group for each serie
      .selectAll(`.${this.groupClassName}`)
      .attr('transform', ((d: FlChart2dSerie<FlChart2dDatum>) => this.getGroupTranslate(input.xScale, input.chartWidth, d.key)))
      // for each group generate the values
      .each((data: FlChart2dSerie<FlChart2dDatum>, index, nodes: SVGElement[]) =>
        this.drawBoxPlot(nodes[index], data, (input.xScale as unknown as FlChartAxisScaleBand).bandwidth(), input));
  }

  private drawBoxPlot(group: SVGElement, serie: FlChart2dSerie<FlChart2dDatum>,
                      groupWidth: number, input: FlChart2dRendererInput<FlChart2dMultiSerie<FlChart2dDatum>>): void {
    const boxData: FlChartBoxPlotData = flChartGetBoxPlotData(serie.getData().map(d => d.getY().valueOf()));

    const xCenter = groupWidth / 2;

    // Show the main vertical line
    select(group)
      .selectAll(`.${this.verticalLineClassName}`)
      .attr('x1', xCenter)
      .attr('x2', xCenter)
      .attr('y1', input.yScale.scale(boxData.min))
      .attr('y2', input.yScale.scale(boxData.max))
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
      .data([boxData.min, boxData.median, boxData.max])
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

  private onMouseHover(event: MouseEvent, serie: FlChart2dSerie<FlChart2dDatum>): void {
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
