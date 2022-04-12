// abstract class to build line or scatter plot
import {FlChartScaleColor, FlChartScaleColorMulti} from '../scale/fl-chart-scale-color.class';
import {FlChart2dMultiSerie} from '../data/fl-chart-multi-serie.class';
import {FlChartContainer, FlChartContainer2Axis} from '../drawer/fl-chart-container.class';
import {FlChartScaleLinear, FlChartScaleNumber} from '../scale/fl-chart-scale.class';
import {FlChartAxis} from '../drawer/fl-chart-axis.class';
import {FlChartSVGLegend} from '../legend/fl-chart-legend.class';
import {FlChartLegendMultiSeries} from '../legend/fl-chart-legend-multi-series.class';
import {FlChart2dBrush, FlChartBrush} from '../drawer/fl-chart-brush.class';
import {FlChart2AxisRenderer} from '../../renderer/fl-chart-renderer.class';
import {FlChartRendererLine} from '../../renderer/fl-chart-renderer-line.plot';
import {FlChartRendererScatterPlot} from '../../renderer/fl-chart-renderer-scatter.plot';
import {FlChartConfig, FlChartRightSectionConfig} from '../fl-chart-config.class';
import {
  FlChartLegendMultiSeriesComponent
} from '../../component/fl-chart-right-section/fl-chart-legend-multi-series/fl-chart-legend-multi-series.component';
import {
  FlChartScatterPlotLegendData,
  FlChartScatterRightSectionComponent
} from '../../component/fl-chart-right-section/fl-chart-scatter-right-section/fl-chart-scatter-right-section.component';
import {FlChart2dDatum} from '../data/fl-chart-data.class';
import {FlTagHelper} from '../../../fl-tag/fl-tag.class';

abstract class FlChartLinear2d extends FlChartConfig {

  protected readonly seriesColorScale: FlChartScaleColor;

  protected readonly renderers: FlChart2AxisRenderer<FlChart2dMultiSerie<FlChart2dDatum>>[];

  constructor(protected dataContainer: FlChart2dMultiSerie<FlChart2dDatum>) {
    super();
    this.seriesColorScale = FlChartScaleColorMulti.fromMultiSeries(dataContainer, true);
    this.renderers = this.createRenderers();
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
      .addRenderer(this.renderers)
      .initData(this.dataContainer);

    return chartContainer;
  }

  getSVGLegend(): FlChartSVGLegend {
    return new FlChartLegendMultiSeries(this.dataContainer.series, this.seriesColorScale);
  }


  getZoomBrush(): FlChartBrush {
    return new FlChart2dBrush();
  }

  protected abstract createRenderers(): FlChart2AxisRenderer<FlChart2dMultiSerie<any>>[];

  protected abstract getExtendDomain(): number;

}

export class FlChartLine2d extends FlChartLinear2d {

  createRenderers(): FlChart2AxisRenderer<FlChart2dMultiSerie<any>>[] {
    return [new FlChartRendererLine(this.seriesColorScale), new FlChartRendererScatterPlot(this.seriesColorScale)];
  }

  protected getExtendDomain(): number {
    return 0.5;
  }

  getLegendConfig(): FlChartRightSectionConfig {
    return {
      componentType: FlChartLegendMultiSeriesComponent,
      data: this.dataContainer.getSerieWithColors(this.seriesColorScale)
    };
  }
}

export class FlChartScatterPlot2d extends FlChartLinear2d {

  createRenderers(): FlChart2AxisRenderer<FlChart2dMultiSerie<any>>[] {
    return [new FlChartRendererScatterPlot(this.seriesColorScale)];
  }

  private getScatterPlotRenderer(): FlChartRendererScatterPlot {
    return this.renderers[0] as FlChartRendererScatterPlot;
  }

  protected getExtendDomain(): number {
    return 0.5;
  }

  getLegendConfig(): FlChartRightSectionConfig {
    // retrieve all the tags
    const tags: Record<string, string>[] = [];
    for (const serie of this.dataContainer.series) {
      for(const data of serie.data) {
        if (data.tags && Object.keys(data.tags).length > 0) {
          tags.push(data.tags);
        }
      }
    }
    const data: FlChartScatterPlotLegendData = {
      legends: this.dataContainer.getSerieWithColors(this.seriesColorScale),
      scatterRenderer: this.getScatterPlotRenderer(),
      tags: FlTagHelper.groupTagsByKey(tags)
    };
    return {
      componentType: FlChartScatterRightSectionComponent,
      data: data
    };
  }
}
