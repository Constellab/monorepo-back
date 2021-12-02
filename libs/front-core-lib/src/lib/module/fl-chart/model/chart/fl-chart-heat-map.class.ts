import {FlChartConfig2} from '../fl-chart-config.class';
import {FlChartContainer, FlChartContainer2Axis} from '../drawer/fl-chart-container.class';
import {FlChartLegend} from '../legend/fl-chart-legend.class';
import {FlChartBrush} from '../drawer/fl-chart-brush.class';
import {FlChart2dMultiSerie} from '../data/fl-chart-multi-serie.class';
import {FlChart3dDatum} from '../data/fl-chart-data.class';
import {FlChartScaleColor, FlChartScaleColorLinear} from '../scale/fl-chart-scale-color.class';
import {FlChartDomain} from '../fl-chart-domain.class';
import {FlChartLegendHeatMap} from '../legend/fl-chart-legend-heat-map.class';
import {FlChartScaleBand} from '../scale/fl-chart-scale.class';
import {FlChartAxis, FlChartAxisBand} from '../drawer/fl-chart-axis.class';
import {FlChartRendererHeatMap} from '../../renderer/fl-chart-renderer-heat-map.plot';

export class FlChartHeatMap extends FlChartConfig2 {

  private readonly colorScale: FlChartScaleColor;
  private readonly domain: [number, number];

  // predefined size for the rects
  private readonly rectSize = 15;


  constructor(protected dataContainer: FlChart2dMultiSerie<FlChart3dDatum>) {
    super();

    // build color scale
    const zValues: number[] = dataContainer.getData().map(data => data.getZ()?.valueOf() ?? null)
      .filter(data => data != null);
    this.domain = FlChartDomain.getLinearDomain(zValues);
    this.colorScale = new FlChartScaleColorLinear(this.domain);
  }

  getChartContainer(): FlChartContainer<any> {
    const chartContainer: FlChartContainer2Axis<FlChart2dMultiSerie<FlChart3dDatum>> =
      new FlChartContainer2Axis();

    // Build X axis
    const xScale: FlChartScaleBand = new FlChartScaleBand()
      .setInitialDomain(this.dataContainer.getDomainXComplete())
      .padding(0.01);
    const xAxis: FlChartAxis = new FlChartAxisBand('bottom').setScale(xScale)
      .setSmartTickFormat(FlChartAxisBand.tickCharacterWidth * 3);

    // Build Y axis
    const yScale: FlChartScaleBand = new FlChartScaleBand()
      .setInitialDomain(this.dataContainer.getDomainYComplete())
      .padding(0.01);
    const yAxis: FlChartAxis = new FlChartAxisBand('left').setScale(yScale)
      .setSmartTickFormat(FlChartAxisBand.tickTextHeight);

    chartContainer
      .initXAxis(xAxis)
      .initAxisY(yAxis)
      .addRenderer(new FlChartRendererHeatMap(this.colorScale))
      .initData(this.dataContainer);

    // force the size of the chart so the heat map rect are squares
    const width = this.rectSize * this.dataContainer.series.length;
    const height = this.rectSize * this.dataContainer.maxSerieDataCount();
    chartContainer.setChartRendererSize(width, height);

    return chartContainer;
  }

  getLegend(): FlChartLegend {
    return new FlChartLegendHeatMap(this.colorScale, this.domain);
  }

  // no zoom
  getZoomBrush(): FlChartBrush {
    return undefined;
  }


}
