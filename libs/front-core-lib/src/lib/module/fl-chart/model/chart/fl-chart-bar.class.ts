import {FlChartConfig, FlChartRightSectionConfig} from '../fl-chart-config.class';
import {FlChartContainer, FlChartContainer2Axis} from '../drawer/fl-chart-container.class';
import {FlChartSVGLegend} from '../legend/fl-chart-legend.class';
import {FlChart2dBrushX, FlChartBrush} from '../drawer/fl-chart-brush.class';
import {FlChartScaleColor, FlChartScaleColorMulti} from '../scale/fl-chart-scale-color.class';
import {FlChartLegendMultiSeries} from '../legend/fl-chart-legend-multi-series.class';
import {FlChart2dMultiSerie} from '../data/fl-chart-multi-serie.class';
import {FlChart2AxisRenderer} from '../../renderer/fl-chart-renderer.class';
import {FlChartAxis, FlChartAxisBand} from '../drawer/fl-chart-axis.class';
import {FlChartRendererStackedBarPlot} from '../../renderer/fl-chart-renderer-stacked-bar.plot';
import {FlChartRendererBarPlot} from '../../renderer/fl-chart-renderer-bar.plot';
import {FlChartScaleBand, FlChartScaleLinear, FlChartScaleNumber} from '../scale/fl-chart-scale.class';
import {
  FlChartLegendMultiSeriesComponent,
  FlChartLegendMultiSeriesInput
} from '../../component/fl-chart-right-section/fl-chart-legend-multi-series/fl-chart-legend-multi-series.component';

abstract class FlChartBar extends FlChartConfig {

  protected readonly seriesColorScale: FlChartScaleColor;

  constructor(protected dataContainer: FlChart2dMultiSerie<any>) {
    super();
    this.seriesColorScale = FlChartScaleColorMulti.fromMultiSeries(dataContainer);
  }

  getChartContainer(): FlChartContainer<any> {
    const chartContainer: FlChartContainer2Axis<FlChart2dMultiSerie<any>> = new FlChartContainer2Axis();

    // build the x-axis and scale based on ScaleBand
    const xScale: FlChartScaleBand = new FlChartScaleBand()
      .setInitialDomain(this.dataContainer.getDomainXComplete());
    const xAxis: FlChartAxisBand = new FlChartAxisBand('bottom').setScale(xScale)
      .rotateTickText()
      .setSmartTickFormat(FlChartAxisBand.tickXRotateWidth, this.dataContainer.axisXLabelTicksFormat)
      .setLabel(this.dataContainer.axisXLabel);


    // build the y-axis and scale linear
    const yScale: FlChartScaleLinear = new FlChartScaleNumber()
      .setInitialDomain(this.getYDomain());
    const yAxis: FlChartAxis = new FlChartAxis('left').setScale(yScale)
      .setLabel(this.dataContainer.axisYLabel);

    return chartContainer
      .initXAxis(xAxis)
      .initAxisY(yAxis)
      .addRenderer(this.getRenderers())
      .initData(this.dataContainer);
  }

  getSVGLegend(): FlChartSVGLegend {
    return new FlChartLegendMultiSeries(this.dataContainer.series, this.seriesColorScale);
  }

  getRightSectionConfig(): FlChartRightSectionConfig {
    const data: FlChartLegendMultiSeriesInput = {
      series: this.dataContainer.series,
      seriesColorScale: this.seriesColorScale
    };
    return {
      componentType: FlChartLegendMultiSeriesComponent,
      data: data
    };
  }

  getZoomBrush(): FlChartBrush {
    return new FlChart2dBrushX();
  }

  protected abstract getRenderers(): FlChart2AxisRenderer<FlChart2dMultiSerie<any>>[];

  protected abstract getYDomain(): number[];

  destroy(): void {
  }

}

export class FlChartBarPlot extends FlChartBar {
  protected getRenderers(): FlChart2AxisRenderer<FlChart2dMultiSerie<any>>[] {
    return [new FlChartRendererBarPlot(this.seriesColorScale)];
  }

  protected getYDomain(): number[] {
    return this.dataContainer.getDomainYLinear(0, 0);
  }

}

export class FlChartHistogram extends FlChartBar {
  protected getRenderers(): FlChart2AxisRenderer<FlChart2dMultiSerie<any>>[] {
    return [new FlChartRendererBarPlot(this.seriesColorScale)];
  }

  protected getYDomain(): number[] {
    return this.dataContainer.getDomainYLinear(0, 0);
  }
}


export class FlChartStackedBar extends FlChartBar {
  protected getRenderers(): FlChart2AxisRenderer<FlChart2dMultiSerie<any>>[] {
    return [new FlChartRendererStackedBarPlot(this.seriesColorScale)];
  }

  protected getYDomain(): number[] {
    return this.dataContainer.getDomainYStacked(0, 0);
  }
}
