import {FlChartRightSectionConfig} from '../fl-chart-config.class';
import {FlChart2dMultiSerie} from '../data/fl-chart-multi-serie.class';
import {FlChartLinear2d} from './fl-chart-linear-2d.class';
import {FlChart2AxisRenderer} from '../../renderer/fl-chart-renderer.class';
import {
  FlChartLegendSeriesWithTagsComponent,
  FlChartLegendSerieWithTagsInput
} from '../../component/fl-chart-right-section/fl-chart-legend-series-with-tags/fl-chart-legend-series-with-tags.component';
import {FlChartLine, FlChartRendererStraightLines} from '../../renderer/fl-chart-renderer-straight-lines.class';
import {FlChartSVGLegend} from '../legend/fl-chart-legend.class';
import {FlChartRendererVulcanoPlot} from '../../renderer/fl-chart-renderer-vulcano.plot';

export class FlChartVulcanoPlot extends FlChartLinear2d {

  constructor(dataContainer: FlChart2dMultiSerie<any>,
              private xThreshold: number,
              private yThreshold: number) {
    super(dataContainer);
  }

  createRenderers(): FlChart2AxisRenderer<FlChart2dMultiSerie<any>>[] {
    const scatterPlotRenderer = new FlChartRendererVulcanoPlot(this.seriesColorScale, this.tagColorer,
      this.xThreshold, this.yThreshold);
    return [
      scatterPlotRenderer,
      new FlChartRendererStraightLines(this.getLines())
    ];
  }

  private getLines(): FlChartLine[] {
    return [
      {
        orientation: 'vertical',
        position: -this.xThreshold,
      },
      {
        orientation: 'vertical',
        position: this.xThreshold,
      },
      {
        orientation: 'horizontal',
        position: this.yThreshold,
      }
    ];
  }

  protected getExtendDomain(): number {
    return 0.5;
  }

  getRightSectionConfig(): FlChartRightSectionConfig {
    const data: FlChartLegendSerieWithTagsInput = {
      legends: null,
      tagColorer: this.tagColorer
    };
    return {
      componentType: FlChartLegendSeriesWithTagsComponent,
      data: data
    };
  }


  getSVGLegend(): FlChartSVGLegend {
    return null;
  }
}
