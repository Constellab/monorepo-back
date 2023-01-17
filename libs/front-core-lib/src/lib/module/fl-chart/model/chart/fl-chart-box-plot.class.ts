import {FlChartConfig, FlChartRightSectionConfig} from '../fl-chart-config.class';
import {FlChartContainer, FlChartContainer2Axis} from '../drawer/fl-chart-container.class';
import {FlChartSVGLegend} from '../legend/fl-chart-legend.class';
import {FlChart2dBrushX, FlChartBrush} from '../drawer/fl-chart-brush.class';
import {FlChartScaleColorMulti} from '../scale/fl-chart-scale-color.class';
import {FlChartMultiSerie} from '../data/fl-chart-multi-serie.class';
import {FlChartBoxPlotData} from '../data/fl-chart-box-plot-data.class';
import {FlChartLegendMultiSeries} from '../legend/fl-chart-legend-multi-series.class';
import {FlChartScaleBand, FlChartScaleLinear, FlChartScaleNumber} from '../scale/fl-chart-scale.class';
import {FlChartAxis, FlChartAxisBand} from '../drawer/fl-chart-axis.class';
import {FlChartDomain} from '../fl-chart-domain.class';
import {FlChartRendererBoxPlot} from '../../renderer/fl-chart-renderer-box.plot';
import {
  FlChartLegendSeriesWithTagsComponent,
  FlChartLegendSerieWithTagsInput
} from '../../component/fl-chart-right-section/fl-chart-legend-series-with-tags/fl-chart-legend-series-with-tags.component';
import {FlColorHelper} from '../../../../utils/fl-color-helper.class';
import {FlTagColorer} from '../../../fl-tag/fl-tag-colorer.class';

// Config box plot
export class FlChartBoxPlot extends FlChartConfig {

  protected readonly seriesColorScale: FlChartScaleColorMulti;
  private readonly tagColorer: FlTagColorer;

  constructor(protected dataContainer: FlChartMultiSerie<FlChartBoxPlotData>) {
    super();
    this.seriesColorScale = FlChartScaleColorMulti.fromMultiSeries(dataContainer);
    this.tagColorer = FlTagColorer.fromGroupedTags(this.dataContainer.getTagsGroupByKey(),
      FlColorHelper.getColorList());
  }

  getChartContainer(): FlChartContainer<any> {
    const chartContainer: FlChartContainer2Axis<FlChartMultiSerie<any>> = new FlChartContainer2Axis();

    // build the x-axis and scale based on ScaleBand
    // the x domain is an array of the number of series with index of the serie
    const xScale: FlChartScaleBand = new FlChartScaleBand()
      .setInitialDomain(this.dataContainer.getBiggestSerieDomainCompleteIndexes())
      .paddingOuter(0.3);
    const xAxis: FlChartAxis = new FlChartAxisBand('bottom').setScale(xScale)
      .rotateTickText()
      .setSmartTickFormat(FlChartAxisBand.tickXRotateWidth, this.dataContainer.axisXLabelTicksFormatter)
      .setLabel(this.dataContainer.axisXLabel);


    const data = this.dataContainer.getData();
    const numberData: number[] = [];
    for (const d of data) {
      numberData.push(d.min, d.lowerWhisker, d.max, d.upperWhisker);
    }
    // build the y-axis and scale linear
    const yScale: FlChartScaleLinear = new FlChartScaleNumber()
      .setInitialDomain(FlChartDomain.getLinearDomain(numberData, 0, 0));
    const yAxis: FlChartAxis = new FlChartAxis('left').setScale(yScale)
      .setLabel(this.dataContainer.axisYLabel);

    return chartContainer
      .initXAxis(xAxis)
      .initAxisY(yAxis)
      .addRenderer(new FlChartRendererBoxPlot(this.seriesColorScale.exportToColorSeriesFunction(), this.tagColorer))
      .initData(this.dataContainer);
  }

  getSVGLegend(): FlChartSVGLegend {
    return new FlChartLegendMultiSeries(this.dataContainer.series, this.seriesColorScale);
  }


  getRightSectionConfig(): FlChartRightSectionConfig {
    const data: FlChartLegendSerieWithTagsInput = {
      series: this.dataContainer.series,
      seriesColorScale: this.seriesColorScale,
      tagColorer: this.tagColorer
    };

    return {
      componentType: FlChartLegendSeriesWithTagsComponent,
      data: data
    };
  }

  getZoomBrush(): FlChartBrush {
    return new FlChart2dBrushX();
  }


  destroy(): void {
    this.tagColorer.destroy();
  }

}
