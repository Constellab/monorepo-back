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
import {FlChartColorFunction, flChartTransparentColorOpacity} from '../scale/fl-chart-scale-color.class';
import {FlChartDataWithSerie} from '../data/fl-chart-serie.class';
import {FlChart2dDatum} from '../data/fl-chart-data.class';
import {FlColorHelper} from '../../../../utils/fl-color-helper.class';
import {FlChartRendererScatterPlot} from '../../renderer/fl-chart-renderer-scatter.plot';

export class FlChartVulcanoPlot extends FlChartLinear2d {

  constructor(dataContainer: FlChart2dMultiSerie<any>,
              private xThreshold: number,
              private yThreshold: number) {
    super(dataContainer);
    this.xThreshold = Math.abs(this.xThreshold);
  }

  createRenderers(): FlChart2AxisRenderer<FlChart2dMultiSerie<any>>[] {
    const scatterPlotRenderer = new FlChartRendererScatterPlot(this.getColorFunction(), this.tagColorer);
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
      series: null, // deactivate the series list
      seriesColorScale: null, // deactivate the series list
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

  private getColorFunction(): FlChartColorFunction<FlChartDataWithSerie<unknown>> {
    const colors = FlColorHelper.getColorList(flChartTransparentColorOpacity);
    const xThreshold = Math.abs(this.xThreshold);
    return (d: FlChartDataWithSerie<FlChart2dDatum>) => {
      if (d.data.getX() < -xThreshold && d.data.getY() > this.yThreshold) {
        return colors[0];
      } else if (d.data.getX() > xThreshold && d.data.getY() > this.yThreshold) {
        return colors[1];
      } else {
        return this.getTheme().greyLowContrast;
      }
    };
  }
}
