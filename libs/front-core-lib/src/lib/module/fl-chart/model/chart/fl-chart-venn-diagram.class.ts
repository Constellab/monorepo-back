import {FlChartConfig, FlChartRightSectionConfig} from '../fl-chart-config.class';
import {FlChartContainer, FlChartContainerNoAxis} from '../drawer/fl-chart-container.class';
import {FlChartSVGLegend} from '../legend/fl-chart-legend.class';
import {FlChartBrush} from '../drawer/fl-chart-brush.class';
import {FlChartScaleColor, FlChartScaleColorMulti} from '../scale/fl-chart-scale-color.class';
import {FlChartVennData} from '../data/fl-chart-venn-data.class';
import {FlChartLegendMultiSeries, FlLegend} from '../legend/fl-chart-legend-multi-series.class';
import {FlChartRendererVennDiagram} from '../../renderer/fl-chart-renderer-venn-diagram.plot';
import {
  FlChartLegendMultiSeriesComponent,
  FlChartLegendMultiSeriesInput
} from '../../component/fl-chart-right-section/fl-chart-legend-multi-series/fl-chart-legend-multi-series.component';
import {FlChartSerieSimple} from '../data/fl-chart-serie.class';

export class FlChartVennDiagram extends FlChartConfig {

  private readonly colorScale: FlChartScaleColor;

  constructor(protected readonly dataContainer: FlChartVennData) {
    super();
    this.colorScale = new FlChartScaleColorMulti(dataContainer.groupNames);
  }

  getChartContainer(): FlChartContainer<any> {
    const chartContainer: FlChartContainerNoAxis<FlChartVennData> = new FlChartContainerNoAxis();

    const colorScale: FlChartScaleColor = new FlChartScaleColorMulti(this.dataContainer.groupNames);

    return chartContainer
      .addRenderer(new FlChartRendererVennDiagram(colorScale))
      .initData(this.dataContainer);
  }

  getSVGLegend(): FlChartSVGLegend {
    // create the legend object where key = name = groupName
    const legends: FlLegend[] = this.dataContainer.groupNames.map(groupName => ({name: groupName, key: groupName}));
    return new FlChartLegendMultiSeries(legends, this.colorScale);
  }

  getRightSectionConfig(): FlChartRightSectionConfig {
    const series: FlChartSerieSimple[] = this.dataContainer.groupNames.map(groupName => ({
      name: groupName,
      key: groupName,
      color: this.colorScale.scale(groupName)
    }));
    const data: FlChartLegendMultiSeriesInput = {
      series: series,
      seriesColorScale: this.colorScale
    };
    return {
      componentType: FlChartLegendMultiSeriesComponent,
      data: data
    };
  }

  // no zoom
  getZoomBrush(): FlChartBrush {
    return undefined;
  }

  destroy(): void {
  }


}
