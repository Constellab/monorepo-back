import {FlChartSvg} from '../model/fl-chart-svg.class';
import {FlChart2dMultipleSerie} from '../model/fl-chart-2d-serie.class';
import {FlChartComponentType} from '../model/fl-chart-component.class';
import {FlChartContainer2d} from '../model/fl-chart-container.class';
import {FlChartAxisScale, FlChartAxisScaleBand, FlChartAxisScaleLinear, FlChartAxisScaleNumber} from '../model/fl-chart-scale.class';
import {Numeric} from 'd3';
import {FlChartAxis} from '../model/fl-chart-axis.class';
import {FlChartScatterPlotRendererMulti} from '../renderer/fl-chart-scatter-plot-renderer-multi.class';
import {FlChartScaleColor, FlChartScaleColorMulti} from '../model/fl-chart-scale-color.class';
import {FlChartRendererLineMulti} from '../renderer/fl-chart-renderer-line-multi.class';
import {FlChart2dRendererMultiple} from '../model/fl-chart-2d-renderer.class';
import {FlChartHistogramMultiRenderer} from '../renderer/fl-chart-histogram-multi-renderer.class';
import {FlChart2dBrush, FlChart2dBrushX} from '../model/fl-chart-2d-brush.class';

export class FlChartFactory {


  public static buildChart2dContainer(chartSVG: FlChartSvg, data: FlChart2dMultipleSerie<any>,
                                      chartType: FlChartComponentType, seriesColorScale: FlChartScaleColor)
    : FlChartContainer2d<FlChart2dMultipleSerie<any>> {

    switch (chartType) {
      case FlChartComponentType.LINE:
        return this.buildLineMultiContainer(chartSVG, data, seriesColorScale);
      case FlChartComponentType.SCATTER_PLOT:
        return this.buildScatterPlotMultiContainer(chartSVG, data, seriesColorScale);
      case FlChartComponentType.HISTOGRAM:
        return this.buildHistogramMultiContainer(chartSVG, data, seriesColorScale);
    }

    throw new Error('Unsupported chart type ' + chartType);

  }

  /**
   * Build a Scatter Plot multi container
   */
  private static buildScatterPlotMultiContainer(chartSVG: FlChartSvg, dataContainer: FlChart2dMultipleSerie<any>,
                                                seriesColorScale: FlChartScaleColor)
    : FlChartContainer2d<FlChart2dMultipleSerie<any>> {

    const renderer = new FlChartScatterPlotRendererMulti(seriesColorScale);

    return this.buildLinear2dMultiContainer(chartSVG, dataContainer, [renderer]);
  }

  /**
   * Build a Line multi container
   */
  private static buildLineMultiContainer(chartSVG: FlChartSvg, dataContainer: FlChart2dMultipleSerie<any>,
                                         seriesColorScale: FlChartScaleColor)
    : FlChartContainer2d<FlChart2dMultipleSerie<any>> {
    const renderer = new FlChartRendererLineMulti(seriesColorScale);

    // also use a scatter plot renderer to show point on the line
    const scatterPlot = new FlChartScatterPlotRendererMulti(seriesColorScale);


    return this.buildLinear2dMultiContainer(chartSVG, dataContainer, [renderer, scatterPlot]);
  }

  /**
   * Build a Histogram multi container
   */
  private static buildHistogramMultiContainer(chartSVG: FlChartSvg, dataContainer: FlChart2dMultipleSerie<any>,
                                              seriesColorScale: FlChartScaleColor)
    : FlChartContainer2d<FlChart2dMultipleSerie<any>> {

    const chartContainer: FlChartContainer2d<FlChart2dMultipleSerie<any>> = this.getChartContainer2d(chartSVG);

    // build the x axis and scale based on ScaleBand
    const xScale: FlChartAxisScale<Numeric> = new FlChartAxisScaleBand()
      .domain(dataContainer.getDomainX())
      .range(chartContainer.getRangeX());
    const xAxis: FlChartAxis = new FlChartAxis('bottom').setScale(xScale)
      .setTickFormat(dataContainer.axisXLabelFormat);

    // build the y axis and scale linear
    const yScale: FlChartAxisScaleLinear<Numeric> = new FlChartAxisScaleNumber()
      .domain([0, dataContainer.getDomainY()[1]])
      .range(chartContainer.getRangeY());
    const yAxis: FlChartAxis = new FlChartAxis('left').setScale(yScale);

    // Activate brush only on X axis before the data init so the brush doesn't prevent hover events
    new FlChart2dBrushX(chartContainer);

    chartContainer
      .initXAxis(xAxis)
      .initAxisY(yAxis)
      .addRenderer(new FlChartHistogramMultiRenderer(seriesColorScale))
      .initData(dataContainer);


    return chartContainer;
  }

  /**
   * Build a linear multi chart container such as ScatterPlot Multi of Line Multi
   */
  private static buildLinear2dMultiContainer(chartSVG: FlChartSvg, dataContainer: FlChart2dMultipleSerie<any>,
                                             renderers: FlChart2dRendererMultiple<FlChart2dMultipleSerie<any>>[]):
    FlChartContainer2d<FlChart2dMultipleSerie<any>> {
    const chartContainer: FlChartContainer2d<FlChart2dMultipleSerie<any>> = this.getChartContainer2d(chartSVG);

    // Build X axis
    const xScale: FlChartAxisScaleLinear<Numeric> = new FlChartAxisScaleNumber()
      .domain(dataContainer.getDomainX())
      .range(chartContainer.getRangeX());
    const xAxis: FlChartAxis = new FlChartAxis('bottom').setScale(xScale)
      .setTickFormat(dataContainer.axisXLabelFormat);

    // Build Y axis
    const yScale: FlChartAxisScaleLinear<Numeric> = new FlChartAxisScaleNumber()
      .domain(dataContainer.getDomainY())
      .range(chartContainer.getRangeY());
    const yAxis: FlChartAxis = new FlChartAxis('left').setScale(yScale);

    // activate brush before the data init so the brush doesn't prevent hover events
    new FlChart2dBrush(chartContainer);

    chartContainer
      .initXAxis(xAxis)
      .initAxisY(yAxis)
      .addRenderer(renderers)
      .initData(dataContainer);


    return chartContainer;
  }


  private static getChartContainer2d(chartSVG: FlChartSvg): FlChartContainer2d<any> {
    return new FlChartContainer2d(chartSVG.svg, chartSVG.width, chartSVG.height);
  }

  /**
   * Build a basic color scale for series based on data
   */
  public static getSeriesColorScale(dataContainer: FlChart2dMultipleSerie<any>): FlChartScaleColorMulti {
    return new FlChartScaleColorMulti(dataContainer.series.map(d => d.key));
  }
}
