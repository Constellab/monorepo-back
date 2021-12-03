import {FlChartConfig} from '../fl-chart-config.class';
import {FlChartContainer, FlChartContainer2Axis} from '../drawer/fl-chart-container.class';
import {FlChartLegend} from '../legend/fl-chart-legend.class';
import {FlChart2dBrushX, FlChartBrush} from '../drawer/fl-chart-brush.class';
import {FlChartScaleColor, FlChartScaleColorMulti} from '../scale/fl-chart-scale-color.class';
import {FlChartLegendMultiSeries} from '../legend/fl-chart-legend-multi-series.class';
import {FlChart2dMultiSerie} from '../data/fl-chart-multi-serie.class';
import {FlChart2AxisRenderer} from '../../renderer/fl-chart-renderer.class';
import {FlChartAxis, FlChartAxisBand} from '../drawer/fl-chart-axis.class';
import {FlChartRendererStackedBarPlot} from '../../renderer/fl-chart-renderer-stacked-bar.plot';
import {FlChartRendererBarPlot} from '../../renderer/fl-chart-renderer-bar.plot';
import {FlChartScaleBand, FlChartScaleLinear, FlChartScaleNumber} from '../scale/fl-chart-scale.class';

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
    const xAxis: FlChartAxisBand = new FlChartAxisBand('bottom').setScale(xScale);

    const xTickSize = this.getTickSize();
    if (xTickSize != null) {
      xAxis.setSmartTickFormat(xTickSize, this.dataContainer.axisXLabelFormat);
    } else {
      xAxis.setTickFormat(this.dataContainer.axisXLabelFormat);
    }

    // build the y-axis and scale linear
    const yScale: FlChartScaleLinear = new FlChartScaleNumber()
      .setInitialDomain(this.getYDomain());
    const yAxis: FlChartAxis = new FlChartAxis('left').setScale(yScale);

    return chartContainer
      .initXAxis(xAxis)
      .initAxisY(yAxis)
      .addRenderer(this.getRenderers())
      .initData(this.dataContainer);
  }

  getLegend(): FlChartLegend {
    return new FlChartLegendMultiSeries(this.dataContainer.series, this.seriesColorScale);
  }

  getZoomBrush(): FlChartBrush {
    return new FlChart2dBrushX();
  }

  protected abstract getRenderers(): FlChart2AxisRenderer<FlChart2dMultiSerie<any>>[];

  protected abstract getYDomain(): number[];

  protected abstract getTickSize(): number;
}

export class FlChartBarPlot extends FlChartBar {
  protected getRenderers(): FlChart2AxisRenderer<FlChart2dMultiSerie<any>>[] {
    return [new FlChartRendererBarPlot(this.seriesColorScale)];
  }

  protected getYDomain(): number[] {
    return this.dataContainer.getDomainYLinear(0, 0);
  }

  protected getTickSize(): number {
    return FlChartAxisBand.tickCharacterWidth * 3;
  }
}

export class FlChartHistogram extends FlChartBar {
  protected getRenderers(): FlChart2AxisRenderer<FlChart2dMultiSerie<any>>[] {
    return [new FlChartRendererBarPlot(this.seriesColorScale)];
  }

  protected getYDomain(): number[] {
    return this.dataContainer.getDomainYLinear(0, 0);
  }

  protected getTickSize(): number {
    return 50;
  }
}


export class FlChartStackedBar extends FlChartBar {
  protected getRenderers(): FlChart2AxisRenderer<FlChart2dMultiSerie<any>>[] {
    return [new FlChartRendererStackedBarPlot(this.seriesColorScale)];
  }

  protected getYDomain(): number[] {
    return this.dataContainer.getDomainYStacked(0, 0);
  }

  protected getTickSize(): number {
    return FlChartAxisBand.tickCharacterWidth * 3;
  }
}
