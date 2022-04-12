import {FlChart2AxisRenderer} from './fl-chart-renderer.class';
import {select} from 'd3';
import {FlChartDataWithSerie} from '../model/data/fl-chart-serie.class';
import {FlChartScale, FlChartScaleBand} from '../model/scale/fl-chart-scale.class';
import {FlThemeDetail} from '../../../service/model/fl-theme-detail.class';
import {flRootInjector} from '../../../utils/fl-root-injector';
import {FlThemeService} from '../../../service/fl-theme.service';
import {FlChartBoxPlotData} from '../model/data/fl-chart-box-plot-data.class';
import {FlChartPortalHandler} from '../model/portal-handler/fl-chart-portal-handler.class';
import {
  FlChartBoxPlotDataPortalComponent,
  FlChartBoxPlotDataPortalInput
} from '../component/fl-chart-data-portal/fl-chart-box-plot-data-portal/fl-chart-box-plot-data-portal.component';
import {FlChartMultiSerie} from '../model/data/fl-chart-multi-serie.class';
import {FlChartScaleColor} from '../model/scale/fl-chart-scale-color.class';


export class FlChartRendererBoxPlot extends FlChart2AxisRenderer<FlChartMultiSerie<FlChartBoxPlotData>> {

  private readonly groupClassName: string = 'group';
  private readonly boxPlotGroupClassName: string = 'group-box-plot';
  private readonly verticalLineClassName: string = 'vertical-line';
  private readonly horizontalLineClassName: string = 'horizontal-line';

  private portalHandler: FlChartPortalHandler = new FlChartPortalHandler();

  private theme: FlThemeDetail;

  constructor(public colorScale: FlChartScaleColor) {
    super();
  }

  renderFirst(): void {
    this.initTheme();

    this.refreshRender();
  }


  refreshRender(): void {
    const data: FlChartDataWithSerie<FlChartBoxPlotData>[][] = this.data.data.invert();

    const bandWidth: number = (this.data.xScale as FlChartScaleBand).bandwidth();

    // draw the groups for each invert array
    this.data.container
      // generate a group for each serie
      .selectAll(`.${this.groupClassName}`)
      .data(data)
      .join('g')
      .attr('class', this.groupClassName)  // I add the class line to be able to modify this line later on.
      .attr('transform', (d, i) =>
        this.getGroupTranslate(this.data.xScale, this.data.chartWidth, i))
      .each((data, index, nodes) =>
        this.drawBoxPlotGroup(nodes[index] as any, data, bandWidth));
  }

  //draw the groups for each box plot
  private drawBoxPlotGroup(group: SVGElement, groupData: FlChartDataWithSerie<FlChartBoxPlotData>[],
                           parentGroupWidth: number): void {

    const groupWidth: number = parentGroupWidth / groupData.length;
    // Draw the main vertical line
    select(group)
      .selectAll(`.${this.boxPlotGroupClassName}`)
      .data(groupData)
      .join('g')
      .attr('class', this.boxPlotGroupClassName)
      .attr('transform', (d, i) => `translate(${groupWidth * i},0)`)
      .on('mouseover', (event, d) => this.onMouseHover(event, d))
      .on('mouseout', () => this.onMouseOut())
      .each((data, index, nodes) =>
        this.drawBoxPlot(nodes[index] as any, data, groupWidth));
  }

  // draw on box plot in the group
  private drawBoxPlot(group: SVGElement, dataWithSerie: FlChartDataWithSerie<FlChartBoxPlotData>,
                      groupWidth: number): void {

    if (dataWithSerie.data == null) {
      return;
    }

    const xCenter = groupWidth / 2;

    const padding = 2;
    const x1 = padding;
    const width = groupWidth - (padding * 2);

    // Place the main vertical line
    select(group)
      .selectAll(`.${this.verticalLineClassName}`)
      .data([dataWithSerie])
      .join('line')
      .attr('class', this.verticalLineClassName)
      .attr('x1', xCenter)
      .attr('x2', xCenter)
      .attr('y1', d => this.data.yScale.getColor(d.data.lowerWhisker))
      .attr('y2', d => this.data.yScale.getColor(d.data.upperWhisker))
      .attr('stroke', this.theme.foreground);

    // Place the box
    select(group)
      .selectAll(`rect`)
      .data([dataWithSerie])
      .join('rect')
      .attr('x', x1)
      .attr('y', d => this.data.yScale.getColor(d.data.q3))
      .attr('height', d => (this.data.yScale.getColor(d.data.q1) - this.data.yScale.getColor(d.data.q3)))
      .attr('width', width)
      .attr('stroke', this.theme.foreground)
      .style('fill', (d) => this.colorScale.getColor(d.serieKey));

    // Place median, min and max horizontal lines
    select(group)
      .selectAll(`.${this.horizontalLineClassName}`)
      .data([dataWithSerie.data.lowerWhisker, dataWithSerie.data.median, dataWithSerie.data.upperWhisker])
      .join('line')
      .attr('class', this.horizontalLineClassName)
      .attr('x1', x1)
      .attr('x2', width + padding)
      .attr('y1', (d) => this.data.yScale.getColor(d))
      .attr('y2', (d) => this.data.yScale.getColor(d))
      .attr('stroke', this.theme.foreground);
  }

  // return the position of the group
  private getGroupTranslate(xScale: FlChartScale, chartWidth: number, index: number): string {
    const scale: number = xScale.getColor(index);
    // if the scale return null set the the group outside chart
    return 'translate(' + (scale == null ? (chartWidth + 10) : scale) + ',0)';
  }

  private initTheme(): void {
    this.theme = flRootInjector.get(FlThemeService).getCurrentThemeDetail();
  }

  private onMouseHover(event: MouseEvent, data: FlChartDataWithSerie<FlChartBoxPlotData>): void {
    const input: FlChartBoxPlotDataPortalInput = {
      data: data,
      seriesColorScale: this.colorScale
    };
    this.portalHandler.openPortal(event.target as any, FlChartBoxPlotDataPortalComponent, input);
  }

  private onMouseOut(): void {
    this.portalHandler.closePortal();
  }


}
