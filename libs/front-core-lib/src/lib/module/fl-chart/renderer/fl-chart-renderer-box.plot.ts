import {FlChart2AxisRendererWithColors} from './fl-chart-renderer.class';
import {select} from 'd3';
import {FlChartDataWithSerie} from '../model/data/fl-chart-serie.class';
import {FlChartScale, FlChartScaleBand} from '../model/scale/fl-chart-scale.class';
import {FlChartBoxPlotData} from '../model/data/fl-chart-box-plot-data.class';
import {FlChartPortalHandler} from '../model/portal-handler/fl-chart-portal-handler.class';
import {
  FlChartBoxPlotDataPortalComponent,
  FlChartBoxPlotDataPortalInput
} from '../component/fl-chart-data-portal/fl-chart-box-plot-data-portal/fl-chart-box-plot-data-portal.component';
import {FlChartMultiSerie} from '../model/data/fl-chart-multi-serie.class';
import {FlChartColorFunction} from '../model/scale/fl-chart-scale-color.class';
import {FlTagColorer} from '../../fl-tag/fl-tag-colorer.class';
import {FlTagWithColor} from '../../fl-tag/fl-tag.class';
import {FlColorHelper} from '../../../utils/fl-color-helper.class';


export class FlChartRendererBoxPlot extends FlChart2AxisRendererWithColors<FlChartMultiSerie<FlChartBoxPlotData>,
  FlChartDataWithSerie<FlChartBoxPlotData>> {

  private readonly groupClassName: string = 'group';
  private readonly boxPlotGroupClassName: string = 'group-box-plot';
  private readonly verticalLineClassName: string = 'vertical-line';
  private readonly horizontalLineClassName: string = 'horizontal-line';
  private readonly rectColorClassName: string = 'rect-color';

  private portalHandler: FlChartPortalHandler = new FlChartPortalHandler();


  constructor(defaultColorFunction: FlChartColorFunction<FlChartDataWithSerie<FlChartBoxPlotData>>,
              private tagColorer: FlTagColorer) {
    super(defaultColorFunction);
  }

  renderFirst(): void {

    this.refreshRender();

    this.tagColorer.getSelectedTags$().subscribe(
      tags => this.onSelectedTagUpdate(tags)
    );
  }


  refreshRender(): void {
    const data: FlChartDataWithSerie<FlChartBoxPlotData>[][] = this.data.data.invert();

    const bandWidth: number = (this.data.xAxis.scale as FlChartScaleBand).bandwidth();

    // draw the groups for each invert array
    this.data.container
      // generate a group for each serie
      .selectAll(`.${this.groupClassName}`)
      .data(data)
      .join('g')
      .attr('class', this.groupClassName)  // I add the class line to be able to modify this line later on.
      .attr('transform', (d, i) =>
        this.getGroupTranslate(this.data.xAxis.scale, this.data.chartWidth, i))
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
      .on('mouseover', (event, d) => this.openPortal(event, d, false))
      .on('mouseout', () => this.closePortal())
      .on('click', (event, d) => this.openPortal(event, d, true))
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

    const theme = this.getTheme();

    // Place the main vertical line
    select(group)
      .selectAll(`.${this.verticalLineClassName}`)
      .data([dataWithSerie])
      .join('line')
      .attr('class', this.verticalLineClassName)
      .attr('x1', xCenter)
      .attr('x2', xCenter)
      .attr('y1', d => this.data.yAxis.scale.scale(d.data.lowerWhisker))
      .attr('y2', d => this.data.yAxis.scale.scale(d.data.upperWhisker))
      .attr('stroke', theme.foreground);

    // Place the box
    select(group)
      .selectAll(`.${this.rectColorClassName}`)
      .data([dataWithSerie])
      .join('rect')
      .attr('x', x1)
      .attr('y', d => this.data.yAxis.scale.scale(d.data.q3))
      .attr('height', d => (this.data.yAxis.scale.scale(d.data.q1) - this.data.yAxis.scale.scale(d.data.q3)))
      .attr('width', width)
      .attr('stroke', theme.foreground)
      .attr('class', this.rectColorClassName)
      .style('fill', this.currentColorFunction);

    // Place median, min and max horizontal lines
    select(group)
      .selectAll(`.${this.horizontalLineClassName}`)
      .data([dataWithSerie.data.lowerWhisker, dataWithSerie.data.median, dataWithSerie.data.upperWhisker])
      .join('line')
      .attr('class', this.horizontalLineClassName)
      .attr('x1', x1)
      .attr('x2', width + padding)
      .attr('y1', (d) => this.data.yAxis.scale.scale(d))
      .attr('y2', (d) => this.data.yAxis.scale.scale(d))
      .attr('stroke', theme.foreground);
  }

  // return the position of the group
  private getGroupTranslate(xScale: FlChartScale, chartWidth: number, index: number): string {
    const scale: number = xScale.scale(index);
    // if the scale return null set the group outside chart
    return 'translate(' + (scale == null ? (chartWidth + 10) : scale) + ',0)';
  }

  private openPortal(event: MouseEvent, data: FlChartDataWithSerie<FlChartBoxPlotData>, fixPortal: boolean): void {
    const input: FlChartBoxPlotDataPortalInput = {
      data: data,
      color: this.defaultColorFunction(data),
      tagColorer: this.tagColorer
    };
    this.portalHandler.openPortal(event.target as any, FlChartBoxPlotDataPortalComponent, input, fixPortal);
  }

  private closePortal(): void {
    this.portalHandler.closePortal();
  }

  private onSelectedTagUpdate(selectedTags: FlTagWithColor[]): void {
    if (selectedTags.length > 0) {
      const colorFunction: (d: FlChartDataWithSerie<FlChartBoxPlotData>) => string = (d: FlChartDataWithSerie<FlChartBoxPlotData>) => {
        return FlTagColorer.getObjectColor(d.data.tags, selectedTags, FlColorHelper.transparentBlack);
      };
      this.setColorFunction(colorFunction);
    } else {
      this.resetColors();
    }
  }

  protected refreshColor(colorFunction: (d: FlChartDataWithSerie<FlChartBoxPlotData>) => string): void {
    // update the color of the rects
    this.data.container.selectAll(`.${this.rectColorClassName}`)
      .style('fill', colorFunction);
  }


}
