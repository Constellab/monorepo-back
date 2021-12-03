import {FlChartConfig} from '../fl-chart-config.class';
import {FlChartContainer, FlChartContainerNoAxis} from '../drawer/fl-chart-container.class';
import {FlChartLegend} from '../legend/fl-chart-legend.class';
import {FlChartBrush} from '../drawer/fl-chart-brush.class';
import {FlChartScaleColor, FlChartScaleColorMulti} from '../scale/fl-chart-scale-color.class';
import {FlChartVennData} from '../data/fl-chart-venn-data.class';
import {FlChartLegendMultiSeries, FlLegend} from '../legend/fl-chart-legend-multi-series.class';
import {FlChartRendererVennDiagram} from '../../renderer/fl-chart-renderer-venn-diagram.plot';

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

  getLegend(): FlChartLegend {
    // create the legend object where key = name = groupName
    const legends: FlLegend[] = this.dataContainer.groupNames.map(groupName => ({name: groupName, key: groupName}));
    return new FlChartLegendMultiSeries(legends, this.colorScale);
  }

  // no zoom
  getZoomBrush(): FlChartBrush {
    return undefined;
  }


}
