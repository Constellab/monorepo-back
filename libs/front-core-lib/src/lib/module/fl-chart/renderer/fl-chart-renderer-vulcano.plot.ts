import {FlChartDataWithSerie} from '../model/data/fl-chart-serie.class';
import {FlChart2dDatum} from '../model/data/fl-chart-data.class';
import {FlColorHelper} from '../../../utils/fl-color-helper.class';
import {FlChartRendererScatterPlot} from './fl-chart-renderer-scatter.plot';
import {FlChartScaleColor, flChartTransparentColorOpacity} from '../model/scale/fl-chart-scale-color.class';
import {FlTagColorer} from '../../fl-tag/fl-tag-colorer.class';

/**
 * Renderer for vulcano plot, equals to scatter plot renderer with a different default color function
 */
export class FlChartRendererVulcanoPlot extends FlChartRendererScatterPlot {

  constructor(defaultColorScale: FlChartScaleColor,
              tagColorer: FlTagColorer,
              private xThreshold: number,
              private yThreshold: number) {
    super(defaultColorScale, tagColorer);
  }

  /**
   * Override the default color to only color the top left part of the chart with a color
   * and the top right part with another color. The rest is grey
   * @protected
   */
  protected getDefaultColorFunction(): (d: FlChartDataWithSerie<FlChart2dDatum>) => string {
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
