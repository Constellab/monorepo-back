import {FlChartConfig, FlChartRightSectionConfig} from '../fl-chart-config.class';
import {FlChartContainer, FlChartContainer2Axis} from '../drawer/fl-chart-container.class';
import {FlChartSVGLegend} from '../legend/fl-chart-legend.class';
import {FlChartBrush} from '../drawer/fl-chart-brush.class';
import {FlChart3dDatum, FlChartAxisTickFormat, FlChartDataContainer} from '../data/fl-chart-data.class';
import {FlChartScaleColor, FlChartScaleColorLinear} from '../scale/fl-chart-scale-color.class';
import {FlChartDomain} from '../fl-chart-domain.class';
import {FlChartLegendHeatMap} from '../legend/fl-chart-legend-heat-map.class';
import {FlChartScaleBand} from '../scale/fl-chart-scale.class';
import {FlChartAxis, FlChartAxisBand} from '../drawer/fl-chart-axis.class';
import {FlChartRendererHeatMap} from '../../renderer/fl-chart-renderer-heat-map.plot';
import {
  FlChartLegendHeatMapComponent
} from '../../component/fl-chart-right-section/fl-chart-legend-heat-map/fl-chart-legend-heat-map.component';

/**
 * Data container for heat map data
 */
export class FlChartHeatMapDataContainer implements FlChartDataContainer<FlChart3dDatum> {

  /**
   * Function to format the x-axis labels
   */
  axisXLabelFormat: FlChartAxisTickFormat | null;

  /**
   * Function to format the y-axis labels
   */
  axisYLabelFormat: FlChartAxisTickFormat | null;

  constructor(private data: FlChart3dDatum[][]) {
  }

  getColumnCount(): number {
    return this.data.length;
  }

  getRowCount(): number {
    return Math.max(...this.data.map(d => d.length));
  }

  getData(): FlChart3dDatum[] {
    const data: FlChart3dDatum[] = [];
    this.data.forEach(d => data.push(...d));
    return data;
  }

  getDomainXComplete(): number[] {
    return FlChartDomain.getCompleteDomain(this.getData().map(data => data.getX()));
  }

  getDomainYComplete(): number[] {
    return FlChartDomain.getCompleteDomain(this.getData().map(data => data.getY()));
  }

  /**
   * Set the list of x tick label for all the series. It defines the axisXLabelFormat
   * @param xTickLabels
   */
  public setXTickLabels(xTickLabels: string[]): void {
    if (xTickLabels) {
      this.axisXLabelFormat = (value) => (xTickLabels[value] ?? value).toString();
    }
  }

  /**
   * Set the list of y tick label for all the series. It defines the axisYLabelFormat
   * @param yTickLabels
   */
  public setYTickLabels(yTickLabels: string[]): void {
    if (yTickLabels) {
      this.axisYLabelFormat = (value) => (yTickLabels[value] ?? value).toString();
    }
  }
}

export class FlChartHeatMap extends FlChartConfig {

  private readonly colorScale: FlChartScaleColor;
  private readonly domain: [number, number];

  // predefined size for the rects
  private readonly rectSize = 15;


  constructor(protected dataContainer: FlChartHeatMapDataContainer) {
    super();

    // build color scale
    const zValues: number[] = dataContainer.getData().map(data => data.getZ()?.valueOf() ?? null)
      .filter(data => data != null);
    this.domain = FlChartDomain.getLinearDomain(zValues);
    this.colorScale = new FlChartScaleColorLinear(this.domain);
  }

  getChartContainer(): FlChartContainer<any> {

    // Build X axis
    const xScale: FlChartScaleBand = new FlChartScaleBand()
      .setInitialDomain(this.dataContainer.getDomainXComplete())
      .padding(0.01);
    const xAxis: FlChartAxis = new FlChartAxisBand('bottom').setScale(xScale)
      .setTickFormat(this.dataContainer.axisXLabelFormat)
      .setMaxTickLength(FlChartAxisBand.xRotateTickMaxLength)
      .rotateTickText();

    // Build Y axis
    const yScale: FlChartScaleBand = new FlChartScaleBand()
      // reverse the domain so the y = 0 is on top
      .setInitialDomain(this.dataContainer.getDomainYComplete().reverse())
      .padding(0.01);
    const yAxis: FlChartAxisBand = new FlChartAxisBand('left').setScale(yScale)
      .setMaxTickLength(FlChartAxisBand.yTickMaxLength)
      .setTickFormat(this.dataContainer.axisYLabelFormat);

    const chartContainer: FlChartContainer2Axis<FlChartHeatMapDataContainer> =
      new FlChartContainer2Axis();
    chartContainer
      .initXAxis(xAxis)
      .initAxisY(yAxis)
      .addRenderer(new FlChartRendererHeatMap(this.colorScale))
      .initData(this.dataContainer);

    // force the size of the chart so the heat map rect are squares
    const width = this.rectSize * this.dataContainer.getColumnCount();
    const height = this.rectSize * this.dataContainer.getRowCount();
    chartContainer.setChartRendererSize(width, height);

    return chartContainer;
  }

  getSVGLegend(): FlChartSVGLegend {
    return new FlChartLegendHeatMap(this.colorScale, this.domain);
  }

  getLegendConfig(): FlChartRightSectionConfig {
    return {
      componentType: FlChartLegendHeatMapComponent,
      data: this.getSVGLegend() // use the svg legend renderer
    };
  }

  // no zoom
  getZoomBrush(): FlChartBrush {
    return undefined;
  }


}
