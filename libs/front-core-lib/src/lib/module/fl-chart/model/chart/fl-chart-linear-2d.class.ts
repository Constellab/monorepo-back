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
import {FlChart2dDatum} from '../data/fl-chart-data.class';
import {
  FlChartLegendSeriesWithTagsComponent,
  FlChartLegendSerieWithTagsInput
} from '../../component/fl-chart-right-section/fl-chart-legend-series-with-tags/fl-chart-legend-series-with-tags.component';
import {FlColorHelper} from '../../../../utils/fl-color-helper.class';
import {FlTagColorer} from '../../../fl-tag/fl-tag-colorer.class';

abstract class FlChartLinear2d extends FlChartConfig {

  protected readonly seriesColorScale: FlChartScaleColor;

  protected readonly renderers: FlChart2AxisRenderer<FlChart2dMultiSerie<FlChart2dDatum>>[];

  protected readonly tagColorer: FlTagColorer;

  constructor(protected dataContainer: FlChart2dMultiSerie<FlChart2dDatum>) {
    super();
    this.seriesColorScale = FlChartScaleColorMulti.fromMultiSeries(dataContainer, true);

    // init tag colorer
    this.tagColorer = FlTagColorer.fromGroupedTags(this.dataContainer.getTagsGroupByKey(),
      FlColorHelper.getColorList(0.8));

    this.renderers = this.createRenderers();
  }

  getChartContainer(): FlChartContainer<any> {
    const chartContainer: FlChartContainer2Axis<FlChart2dMultiSerie<any>> = new FlChartContainer2Axis();

    // Build X axis
    const xScale: FlChartScaleLinear = new FlChartScaleNumber()
      .setInitialDomain(this.dataContainer.getDomainXLinear(this.getExtendDomain()));
    const xAxis: FlChartAxis = new FlChartAxis('bottom').setScale(xScale)
      .setTickFormat(this.dataContainer.axisXLabelTicksFormat)
      .setLabel(this.dataContainer.axisXLabel);

    // Build Y axis
    const yScale: FlChartScaleLinear = new FlChartScaleNumber()
      .setInitialDomain(this.dataContainer.getDomainYLinear(this.getExtendDomain()));
    const yAxis: FlChartAxis = new FlChartAxis('left').setScale(yScale)
      .setLabel(this.dataContainer.axisYLabel);

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

  destroy(): void {
    this.tagColorer.destroy();
  }
}

export class FlChartLine2d extends FlChartLinear2d {

  createRenderers(): FlChart2AxisRenderer<FlChart2dMultiSerie<any>>[] {
    return [new FlChartRendererLine(this.seriesColorScale), new FlChartRendererScatterPlot(this.seriesColorScale, this.tagColorer)];
  }

  protected getExtendDomain(): number {
    return 0.5;
  }

  getRightSectionConfig(): FlChartRightSectionConfig {
    return {
      componentType: FlChartLegendMultiSeriesComponent,
      data: this.dataContainer.getSerieWithColors(this.seriesColorScale)
    };
  }
}

export class FlChartScatterPlot2d extends FlChartLinear2d {

  createRenderers(): FlChart2AxisRenderer<FlChart2dMultiSerie<any>>[] {
    return [new FlChartRendererScatterPlot(this.seriesColorScale, this.tagColorer)];
  }

  protected getExtendDomain(): number {
    return 0.5;
  }

  getRightSectionConfig(): FlChartRightSectionConfig {
    const data: FlChartLegendSerieWithTagsInput = {
      legends: this.dataContainer.getSerieWithColors(this.seriesColorScale),
      tagColorer: this.tagColorer
    };
    return {
      componentType: FlChartLegendSeriesWithTagsComponent,
      data: data
    };
  }
}
