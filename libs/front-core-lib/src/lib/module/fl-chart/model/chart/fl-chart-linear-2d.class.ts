// abstract class to build line or scatter plot
import {FlChartScaleColor, FlChartScaleColorMulti} from '../scale/fl-chart-scale-color.class';
import {FlChart2dMultiSerie} from '../data/fl-chart-multi-serie.class';
import {FlChartContainer, FlChartContainer2Axis} from '../drawer/fl-chart-container.class';
import {FlChartScaleLinear, FlChartScaleNumber} from '../scale/fl-chart-scale.class';
import {FlChartAxis} from '../drawer/fl-chart-axis.class';
import {FlChartLegend} from '../legend/fl-chart-legend.class';
import {FlChartLegendMultiSeries} from '../legend/fl-chart-legend-multi-series.class';
import {FlChart2dBrush, FlChartBrush} from '../drawer/fl-chart-brush.class';
import {FlChart2AxisRenderer} from '../../renderer/fl-chart-renderer.class';
import {FlChartRendererLine} from '../../renderer/fl-chart-renderer-line.plot';
import {FlChartRendererScatterPlot} from '../../renderer/fl-chart-renderer-scatter.plot';
import {FlChartConfig} from '../fl-chart-config.class';

abstract class FlChartLinear2d extends FlChartConfig {

  protected readonly seriesColorScale: FlChartScaleColor;

  constructor(protected dataContainer: FlChart2dMultiSerie<any>) {
    super();
    this.seriesColorScale = FlChartScaleColorMulti.fromMultiSeries(dataContainer);
  }

  getChartContainer(): FlChartContainer<any> {
    const chartContainer: FlChartContainer2Axis<FlChart2dMultiSerie<any>> = new FlChartContainer2Axis();

    // Build X axis
    const xScale: FlChartScaleLinear = new FlChartScaleNumber()
      .setInitialDomain(this.dataContainer.getDomainXLinear(this.getExtendDomain()));
    const xAxis: FlChartAxis = new FlChartAxis('bottom').setScale(xScale)
      .setTickFormat(this.dataContainer.axisXLabelFormat);

    // Build Y axis
    const yScale: FlChartScaleLinear = new FlChartScaleNumber()
      .setInitialDomain(this.dataContainer.getDomainYLinear(this.getExtendDomain()));
    const yAxis: FlChartAxis = new FlChartAxis('left').setScale(yScale);

    chartContainer
      .initXAxis(xAxis)
      .initAxisY(yAxis)
      .addRenderer(this.getRenderers())
      .initData(this.dataContainer);

    return chartContainer;
  }

  getLegend(): FlChartLegend {
    return new FlChartLegendMultiSeries(this.dataContainer.series, this.seriesColorScale);
  }

  getZoomBrush(): FlChartBrush {
    return new FlChart2dBrush();
  }

  protected abstract getRenderers(): FlChart2AxisRenderer<FlChart2dMultiSerie<any>>[];

  protected abstract getExtendDomain(): number;

}

export class FlChartLine2d extends FlChartLinear2d {

  getRenderers(): FlChart2AxisRenderer<FlChart2dMultiSerie<any>>[] {
    return [new FlChartRendererLine(this.seriesColorScale), new FlChartRendererScatterPlot(this.seriesColorScale)];
  }

  protected getExtendDomain(): number {
    return 0.5;
  }
}

export class FlChartScatterPlot2d extends FlChartLinear2d {

  getRenderers(): FlChart2AxisRenderer<FlChart2dMultiSerie<any>>[] {
    return [new FlChartRendererScatterPlot(this.seriesColorScale)];
  }

  protected getExtendDomain(): number {
    return 0.5;
  }
}
