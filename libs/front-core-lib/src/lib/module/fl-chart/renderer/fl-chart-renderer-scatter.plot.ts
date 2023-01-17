import {FlChart2dDatum} from '../model/data/fl-chart-data.class';
import {FlChart2AxisRendererWithColors} from './fl-chart-renderer.class';
import {FlChartDataWithSerie} from '../model/data/fl-chart-serie.class';
import {FlChart2dMultiSerie} from '../model/data/fl-chart-multi-serie.class';
import {FlChartColorFunction} from '../model/scale/fl-chart-scale-color.class';
import {FlTagColorer} from '../../fl-tag/fl-tag-colorer.class';
import {FlTagWithColor} from '../../fl-tag/fl-tag.class';
import {FlColorHelper} from '../../../utils/fl-color-helper.class';
import {
  FlChartDataWithSeriePortalInput
} from '../component/fl-chart-data-portal/fl-chart-data-with-serie-portal/fl-chart-data-with-serie-portal.component';
import {FlChartPortalHandler} from '../model/portal-handler/fl-chart-portal-handler.class';

export class FlChartRendererScatterPlot extends FlChart2AxisRendererWithColors<FlChart2dMultiSerie<FlChart2dDatum>,
  FlChartDataWithSerie<FlChart2dDatum>> {

  private portalHandler: FlChartPortalHandler = new FlChartPortalHandler();

  constructor(defaultColorFunction: FlChartColorFunction<FlChartDataWithSerie<FlChart2dDatum>>,
              private tagColorer: FlTagColorer) {
    super(defaultColorFunction);
  }

  renderFirst(): void {
    // Add dots
    this.data.container
      // generate groups for the series
      .selectAll()
      .data(this.data.data.series)
      .enter()
      .append('g')

      // for each group, generate the circle
      .selectAll()
      .data((d) => d.getDataWithSerie(true))
      .enter()
      .append('circle')
      .attr('r', 3)
      .style('fill', this.currentColorFunction)
      .attr('cx', (d: FlChartDataWithSerie<FlChart2dDatum>) => this.data.xScale.scale(d.data.getX()))
      .attr('cy', (d: FlChartDataWithSerie<FlChart2dDatum>) => this.data.yScale.scale(d.data.getY()))
      .on('mouseover', (event, d) => this.onMouseHover(event, d))
      .on('mouseout', () => this.onMouseOut())
      .on('click', (event, d) => this.onMouseClick(event, d));

    this.tagColorer.getSelectedTags$().subscribe(
      tags => this.onSelectedTagUpdate(tags)
    );
  }

  refreshRender(): void {
    this.data.container
      .selectAll(`circle`)
      .transition()
      .attr('cx', (d: FlChartDataWithSerie<FlChart2dDatum>) => this.data.xScale.scale(d.data.getX()))
      .attr('cy', (d: FlChartDataWithSerie<FlChart2dDatum>) => this.data.yScale.scale(d.data.getY()));
  }

  protected refreshColor(colorFunction: FlChartColorFunction<FlChartDataWithSerie<FlChart2dDatum>>): void {
    this.data.container
      .selectAll(`circle`)
      .style('fill', colorFunction);
  }

  private onMouseClick(event: MouseEvent, d: FlChartDataWithSerie<FlChart2dDatum>): void {
    this.openPortal(event, d, true);
  }

  private onMouseHover(event: MouseEvent, d: FlChartDataWithSerie<FlChart2dDatum>): void {
    this.openPortal(event, d, false);
  }

  private openPortal(event: MouseEvent, d: FlChartDataWithSerie<FlChart2dDatum>, fixPortal: boolean): void {
    // this.data.xScale
    const data: FlChartDataWithSeriePortalInput = {
      data: d,
      color: this.currentColorFunction(d),
      tagColorer: this.tagColorer,
      xLabelFormatter: this.data.xAxis.getTickFormatter(),
      yLabelFormatter: this.data.yAxis.getTickFormatter(),
    };
    this.data.data.getDomainXComplete();
    this.portalHandler.openDataWithSeriePortal(event.target as any, data, fixPortal);
  }

  private onMouseOut(): void {
    this.portalHandler.closePortal();
  }

  private onSelectedTagUpdate(selectedTags: FlTagWithColor[]): void {
    if (selectedTags.length > 0) {
      const colorFunction: FlChartColorFunction<FlChartDataWithSerie<FlChart2dDatum>> = (d: FlChartDataWithSerie<FlChart2dDatum>) => {
        return FlTagColorer.getObjectColor(d.data.tags, selectedTags, FlColorHelper.transparentBlack);
      };
      this.setColorFunction(colorFunction);
    } else {
      this.resetColors();
    }
  }

}
