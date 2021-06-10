import {FlChart2dRendererInput, FlChart2dRendererMultiple} from '../model/fl-chart-2d-renderer.class';
import {ascending, Numeric, quantile, select} from 'd3';
import {FlChart2dMultipleSerie, FlChart2dSerie} from '../model/fl-chart-2d-serie.class';
import {FlChart2dDatum} from '../model/fl-chart-2d-data.class';
import {FlChartAxisScale, FlChartAxisScaleBand} from '../model/fl-chart-scale.class';
import {FlThemeDetail} from '../../../service/model/fl-theme-detail.class';
import {flRootInjector} from '../../../utils/fl-root-injector';
import {FlThemeService} from '../../../service/fl-theme.service';


export class FlChartBoxPlotMultiRenderer
  extends FlChart2dRendererMultiple<FlChart2dMultipleSerie<FlChart2dDatum>> {

  private readonly groupClassName: string = 'serie';
  private readonly verticalLineClassName: string = 'vertical-line';
  private readonly horizontalLineClassName: string = 'horizontal-line';

  // private portalHandler: FlChartDataWithSeriePortalHandler = new FlChartDataWithSeriePortalHandler();

  private theme: FlThemeDetail;

  initData(input: FlChart2dRendererInput<FlChart2dMultipleSerie<FlChart2dDatum>>): void {
    this.initTheme();

    input.container
      // generate a group for each serie
      .selectAll()
      .data(input.data.series)
      .enter()
      .append('g')
      .attr('class', this.groupClassName)  // I add the class line to be able to modify this line later on.
      .attr('transform', (d, index) => this.getGroupTranslate(input.xScale, input.chartWidth, index))

      // for each group generate the values
      .each((data, index, nodes) =>
        this.drawSerie(nodes[index], data, (input.xScale as unknown as FlChartAxisScaleBand).bandwidth(), input));
  }

  private drawSerie(group: SVGElement, serie: FlChart2dSerie<FlChart2dDatum>,
                    groupWidth: number, input: FlChart2dRendererInput<FlChart2dMultipleSerie<FlChart2dDatum>>): void {
    // Show the main vertical line
    select(group)
      .append('line')
      .attr('class', this.verticalLineClassName); // todo voir pour utiliser le theme, mais l'export du SVG pose problème

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

  refreshData(input: FlChart2dRendererInput<FlChart2dMultipleSerie<FlChart2dDatum>>): void {
    input.container
      // generate a group for each serie
      .selectAll(`.${this.groupClassName}`)
      .attr('transform', (d, index) => this.getGroupTranslate(input.xScale, input.chartWidth, index))
      // for each group generate the values
      .each((data: FlChart2dSerie<FlChart2dDatum>, index, nodes: SVGElement[]) =>
        this.drawBoxPlot(nodes[index], data, (input.xScale as unknown as FlChartAxisScaleBand).bandwidth(), input));
  }

  private drawBoxPlot(group: SVGElement, serie: FlChart2dSerie<FlChart2dDatum>,
                      groupWidth: number, input: FlChart2dRendererInput<FlChart2dMultipleSerie<FlChart2dDatum>>): void {
    // get the series data value sorted
    const sortedData: number[] = serie.getData().map(d => d.getY().valueOf()).sort(ascending);

    // Compute summary statistics used for the box:
    const q1 = quantile(sortedData, .25);
    const median = quantile(sortedData, .5);
    const q3 = quantile(sortedData, .75);
    const interQuantileRange = q3 - q1;
    const min = q1 - 1.5 * interQuantileRange;
    const max = q1 + 1.5 * interQuantileRange;


    const xCenter = groupWidth / 2;

    // Show the main vertical line
    select(group)
      .selectAll(`.${this.verticalLineClassName}`)
      .attr('x1', xCenter)
      .attr('x2', xCenter)
      .attr('y1', input.yScale.scale(min))
      .attr('y2', input.yScale.scale(max))
      .attr('stroke', this.theme.foreground);

    // Show the box
    select(group)
      .selectAll(`rect`)
      .attr('x', xCenter - groupWidth / 2)
      .attr('y', input.yScale.scale(q3))
      .attr('height', (input.yScale.scale(q1) - input.yScale.scale(q3)))
      .attr('width', groupWidth)
      .attr('stroke', this.theme.foreground)
      .style('fill', () => this.colorScale.scale(serie.key));

    // show median, min and max horizontal lines
    select(group)
      .selectAll(`.${this.horizontalLineClassName}`)
      .data([min, median, max])
      .attr('x1', xCenter - groupWidth / 2)
      .attr('x2', xCenter + groupWidth / 2)
      .attr('y1', (d) => input.yScale.scale(d))
      .attr('y2', (d) => input.yScale.scale(d))
      .attr('stroke', this.theme.foreground);
  }

  // return the position of the group
  private getGroupTranslate(xScale: FlChartAxisScale<Numeric>, chartWidth: number, index: number): string {
    // if the scale return null set the the group outside chart
    return 'translate(' + (xScale.scale(index) == null ? (chartWidth + 10) : xScale.scale(index)) + ',0)';
  }

  private initTheme(): void {
    this.theme = flRootInjector.get(FlThemeService).getCurrentThemeDetail();
  }

  // private onMouseHover(event: MouseEvent, d: FlChartDataWithSerie): void {
  //   this.portalHandler.openPortal(event.target as any, d, this.colorScale);
  // }
  //
  // private onMouseOut(): void {
  //   this.portalHandler.closePortal();
  // }


}
