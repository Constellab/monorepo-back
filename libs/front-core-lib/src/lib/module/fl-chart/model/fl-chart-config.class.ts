import {FlChartContainer} from './drawer/fl-chart-container.class';
import {FlChartSVGLegend} from './legend/fl-chart-legend.class';
import {FlChartBrush} from './drawer/fl-chart-brush.class';
import {Type} from '@angular/core';
import {FlChartRightSectionDirective} from '../component/fl-chart-right-section/fl-chart-right-section.directive';
import {FlThemeDetail} from '../../fl-theme/model/fl-theme-detail.class';
import {FlThemeService} from '../../fl-theme/fl-theme.service';

/**
 * Configuration to create the component for the right section of the chart (usually the legend)
 */
export interface FlChartRightSectionConfig {
  componentType: Type<FlChartRightSectionDirective>;
  data: any; // data to pass to the component
}

/**
 * Configure the size of the chart
 */
export type FlChartSizeConfig = {
  // the complete chart will fit the container
  type: 'fit-container';
} |
  // define a fixed size for the chart renderer (excluding the legend, axis, etc.)
  {
    type: 'fixed';
    width: number;
    height: number;
  }

/**
 * Config object to draw a new chart
 */
export abstract class FlChartConfig {

  public sizeConfig: FlChartSizeConfig = {type: 'fit-container'};

  private _theme: FlThemeDetail;

  abstract getChartContainer(): FlChartContainer<any>;

  abstract getRightSectionConfig(): FlChartRightSectionConfig;

  abstract getSVGLegend(): FlChartSVGLegend;

  abstract getZoomBrush(): FlChartBrush;

  abstract destroy(): void;

  protected getTheme(): FlThemeDetail {
    if (this._theme == null) {
      this._theme = FlThemeService.getInstance().getCurrentThemeDetail();
    }
    return this._theme;
  }
}
