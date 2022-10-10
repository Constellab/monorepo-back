import {Selection} from 'd3-selection';
import {FlChartScale} from '../model/scale/fl-chart-scale.class';
import {FlThemeDetail} from '../../fl-theme/model/fl-theme-detail.class';
import {FlThemeService} from '../../fl-theme/fl-theme.service';
import {FlChartColorFunction} from '../model/scale/fl-chart-scale-color.class';


/**
 * Object needed by the renderer to renderer the chart
 */
export interface FlChartNoAxisRendererInput<Data> {
  container: Selection<Element, null, null, null>;
  data: Data;
  chartHeight: number;
  chartWidth: number;
}

/**
 * Object needed by the renderer to renderer the charts with 2 axis
 */
export interface FlChart2AxisRendererInput<Data> extends FlChartNoAxisRendererInput<Data> {
  xScale: FlChartScale;
  yScale: FlChartScale;
}

/**
 * interface to implement to render graph without axis
 */
export abstract class FlChartNoAxisRenderer<Data> {

  protected data: FlChartNoAxisRendererInput<Data>;

  private _theme: FlThemeDetail;

  abstract renderFirst(): void;

  setData(data: FlChartNoAxisRendererInput<Data>): void {
    this.data = data;
  }

  protected getTheme(): FlThemeDetail {
    if (this._theme == null) {
      this._theme = FlThemeService.getInstance().getCurrentThemeDetail();
    }
    return this._theme;
  }
}


/**
 * interface to implement to render graph with 2 axis
 */
export abstract class FlChart2AxisRenderer<Data> extends FlChartNoAxisRenderer<Data> {

  protected data: FlChart2AxisRendererInput<Data>;

  abstract renderFirst(): void;

  abstract refreshRender(): void;
}


/**
 * interface to implement to render graph with 2 axis that support color change
 * for the data (point, line, ...)
 *
 * @Data data container
 * @Datum one datum of the data to color the element
 */
export abstract class FlChart2AxisRendererWithColors<Data, Datum> extends FlChart2AxisRenderer<Data> {


  // function to return the color for a datum
  protected currentColorFunction: FlChartColorFunction<Datum>;

  protected constructor(protected defaultColorFunction: FlChartColorFunction<Datum>) {
    super();
    // init the current color function
    this.currentColorFunction = defaultColorFunction
  }

  /**
   * Method called when the color function changed to refresh the color on the chart
   * @param colorFunction
   * @protected
   */
  protected abstract refreshColor(colorFunction: FlChartColorFunction<Datum>): void;


  /**
   * Set the default color function
   */
  resetColors(): void {
    this.setColorFunction(this.defaultColorFunction);
  }

  /**
   * Set a new color function
   * @param colorFunction
   */
  setColorFunction(colorFunction: FlChartColorFunction<Datum>): void {
    this.currentColorFunction = colorFunction;

    if (this.data) {
      this.refreshColor(colorFunction);
    }
  }
}
