import {FlChartSvg} from '../model/fl-chart-svg.class';
import {FlChartType} from '../model/fl-chart.class';
import {FlChartContainer2d} from '../model/fl-chart-container.class';
import {FlChartScale, FlChartScaleBand, FlChartScaleLinear, FlChartScaleNumber} from '../model/fl-chart-scale.class';
import {Numeric} from 'd3';
import {FlChartAxis, FlChartAxisBand} from '../model/fl-chart-axis.class';
import {FlChartScatterPlotMultiRenderer} from '../renderer/fl-chart-scatter-plot-multi.renderer';
import {FlChartScaleColor, FlChartScaleColorLinear, FlChartScaleColorMulti} from '../model/fl-chart-scale-color.class';
import {FlChartLineMultiRenderer} from '../renderer/fl-chart-line-multi.renderer';
import {FlChartBarPlotMultiRenderer} from '../renderer/fl-chart-bar-plot-multi.renderer';
import {FlChart2dBrush, FlChart2dBrushX} from '../model/fl-chart-2d-brush.class';
import {FlChartBoxPlotMultiRenderer} from '../renderer/fl-chart-box-plot-multi.renderer';
import {FlChart2dMultiSerie, FlChartMultiSerie} from '../model/data/fl-chart-multi-serie.class';
import {FlChart2dRenderer} from '../model/fl-chart-2d-renderer.class';
import {FlChartDomain} from '../model/fl-chart-domain.class';
import {FlChartHeatMapRenderer} from '../renderer/fl-chart-heat-map.renderer';
import {FlChart3dDatum} from '../model/data/fl-chart-data.class';

export class FlChartFactory {


  public static buildChart2dContainer(chartSVG: FlChartSvg, data: FlChartMultiSerie<any>,
                                      chartType: FlChartType, seriesColorScale: FlChartScaleColor)
    : FlChartContainer2d<FlChartMultiSerie<any>> {

    switch (chartType) {
      case FlChartType.LINE:
        return this.buildLineMultiContainer(chartSVG, data as FlChart2dMultiSerie<any>, seriesColorScale);
      case FlChartType.SCATTER_PLOT:
        return this.buildScatterPlotMultiContainer(chartSVG, data as FlChart2dMultiSerie<any>, seriesColorScale);
      case FlChartType.BAR_PLOT:
        return this.buildBarPlotMultiContainer(chartSVG, data as FlChart2dMultiSerie<any>, seriesColorScale,
          FlChartAxisBand.tickCharacterWidth * 3);
      case FlChartType.HISTOGRAM:
        return this.buildBarPlotMultiContainer(chartSVG, data as FlChart2dMultiSerie<any>, seriesColorScale, 50);
      case FlChartType.BOX_PLOT:
        return this.buildBoxPlotMultiContainer(chartSVG, data, seriesColorScale);
      case FlChartType.HEAT_MAP:
        return this.buildHeatMapContainer(chartSVG, data as FlChart2dMultiSerie<any>);
    }

    throw new Error('Unsupported chart type ' + chartType);

  }

  /**
   * Build a Scatter Plot multi container
   */
  private static buildScatterPlotMultiContainer(chartSVG: FlChartSvg, dataContainer: FlChart2dMultiSerie<any>,
                                                seriesColorScale: FlChartScaleColor)
    : FlChartContainer2d<FlChart2dMultiSerie<any>> {

    const renderer = new FlChartScatterPlotMultiRenderer(seriesColorScale);

    return this.buildLinear2dMultiContainer(chartSVG, dataContainer, [renderer], 0.5);
  }

  /**
   * Build a Line multi container
   */
  private static buildLineMultiContainer(chartSVG: FlChartSvg, dataContainer: FlChart2dMultiSerie<any>,
                                         seriesColorScale: FlChartScaleColor)
    : FlChartContainer2d<FlChart2dMultiSerie<any>> {
    const renderer = new FlChartLineMultiRenderer(seriesColorScale);

    // also use a scatter plot renderer to show point on the line
    const scatterPlot = new FlChartScatterPlotMultiRenderer(seriesColorScale);


    return this.buildLinear2dMultiContainer(chartSVG, dataContainer, [renderer, scatterPlot]);
  }

  /**
   * Build a Bar plot multi container
   */
  private static buildBarPlotMultiContainer(chartSVG: FlChartSvg, dataContainer: FlChart2dMultiSerie<any>,
                                            seriesColorScale: FlChartScaleColor, xTickSize?: number)
    : FlChartContainer2d<FlChart2dMultiSerie<any>> {

    const chartContainer: FlChartContainer2d<FlChart2dMultiSerie<any>> = this.getChartContainer2d(chartSVG);

    // build the x axis and scale based on ScaleBand
    const xScale: FlChartScaleBand = new FlChartScaleBand()
      .setInitialDomain(dataContainer.getDomainXComplete())
      .range(chartContainer.getRangeX());
    const xAxis: FlChartAxisBand = new FlChartAxisBand('bottom').setScale(xScale);

    if (xTickSize != null) {
      xAxis.setSmartTickFormat(50, dataContainer.axisXLabelFormat);
    }

    // build the y axis and scale linear
    const yScale: FlChartScaleLinear = new FlChartScaleNumber()
      .setInitialDomain(dataContainer.getDomainYLinear())
      .range(chartContainer.getRangeY());
    const yAxis: FlChartAxis = new FlChartAxis('left').setScale(yScale);

    // Activate brush only on X axis before the data init so the brush doesn't prevent hover events
    new FlChart2dBrushX(chartContainer);

    chartContainer
      .initXAxis(xAxis)
      .initAxisY(yAxis)
      .addRenderer(new FlChartBarPlotMultiRenderer(seriesColorScale))
      .initData(dataContainer);


    return chartContainer;
  }


  /**
   * Build a Box plot multi container
   */
  private static buildBoxPlotMultiContainer(chartSVG: FlChartSvg, dataContainer: FlChartMultiSerie<number>,
                                            seriesColorScale: FlChartScaleColor)
    : FlChartContainer2d<FlChartMultiSerie<any>> {

    const chartContainer: FlChartContainer2d<FlChartMultiSerie<any>> = this.getChartContainer2d(chartSVG);

    // build the x axis and scale based on ScaleBand
    // the x domain is an array of the number of series with index of the serie
    const xScale: FlChartScale<Numeric> = new FlChartScaleBand()
      .setInitialDomain(dataContainer.getSeriesKeys())
      .range(chartContainer.getRangeX())
      .paddingOuter(0.3);
    const xAxis: FlChartAxis = new FlChartAxis('bottom').setScale(xScale)
      .setTickFormat(() => ''); // no info in x abscissa


    // build the y axis and scale linear
    const yScale: FlChartScaleLinear = new FlChartScaleNumber()
      .setInitialDomain(FlChartDomain.getLinearDomain(dataContainer.getData()))
      .range(chartContainer.getRangeY());
    const yAxis: FlChartAxis = new FlChartAxis('left').setScale(yScale);

    // Activate brush only on X axis before the data init so the brush doesn't prevent hover events
    new FlChart2dBrushX(chartContainer);

    chartContainer
      .initXAxis(xAxis)
      .initAxisY(yAxis)
      .addRenderer(new FlChartBoxPlotMultiRenderer(seriesColorScale))
      .initData(dataContainer);

    return chartContainer;
  }

  /**
   * Build a linear multi chart container such as ScatterPlot Multi of Line Multi
   */
  private static buildLinear2dMultiContainer(chartSVG: FlChartSvg, dataContainer: FlChart2dMultiSerie<any>,
                                             renderers: FlChart2dRenderer<FlChart2dMultiSerie<any>>[],
                                             extendDomain: number = 0):
    FlChartContainer2d<FlChart2dMultiSerie<any>> {
    const chartContainer: FlChartContainer2d<FlChart2dMultiSerie<any>> = this.getChartContainer2d(chartSVG);

    // Build X axis
    const xScale: FlChartScaleLinear = new FlChartScaleNumber()
      .setInitialDomain(dataContainer.getDomainXLinear(extendDomain))
      .range(chartContainer.getRangeX());
    const xAxis: FlChartAxis = new FlChartAxis('bottom').setScale(xScale)
      .setTickFormat(dataContainer.axisXLabelFormat);

    // Build Y axis
    const yScale: FlChartScaleLinear = new FlChartScaleNumber()
      .setInitialDomain(dataContainer.getDomainYLinear(extendDomain))
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

  /**
   * Build a heat map container
   */
  private static buildHeatMapContainer(chartSVG: FlChartSvg, dataContainer: FlChart2dMultiSerie<FlChart3dDatum>):
    FlChartContainer2d<FlChart2dMultiSerie<FlChart3dDatum>> {

    const chartContainer: FlChartContainer2d<FlChart2dMultiSerie<FlChart3dDatum>> = this.getChartContainer2d(chartSVG);

    // Build X axis
    const xScale: FlChartScaleBand = new FlChartScaleBand()
      .setInitialDomain(dataContainer.getDomainXComplete())
      .range(chartContainer.getRangeX())
      .padding(0.01);
    const xAxis: FlChartAxis = new FlChartAxisBand('bottom').setScale(xScale)
      .setSmartTickFormat(FlChartAxisBand.tickCharacterWidth * 3);

    // Build Y axis
    const yScale: FlChartScaleBand = new FlChartScaleBand()
      .setInitialDomain(dataContainer.getDomainYComplete())
      .range(chartContainer.getRangeY())
      .padding(0.01);
    const yAxis: FlChartAxis = new FlChartAxisBand('left').setScale(yScale)
      .setSmartTickFormat(FlChartAxisBand.tickTextHeight);

    // build color scale
    const zValues: number[] = dataContainer.getData().map(data => data.getZ()?.valueOf() ?? null)
      .filter(data => data != null);
    const domain: [number, number] = FlChartDomain.getLinearDomain(zValues);
    const colorScale: FlChartScaleColor = new FlChartScaleColorLinear(domain);

    chartContainer
      .initXAxis(xAxis)
      .initAxisY(yAxis)
      .addRenderer(new FlChartHeatMapRenderer(colorScale))
      .initData(dataContainer);


    return chartContainer;
  }


  private static getChartContainer2d(chartSVG: FlChartSvg): FlChartContainer2d<any> {
    return new FlChartContainer2d(chartSVG.svg, chartSVG.width, chartSVG.height);
  }

  /**
   * Build a basic color scale for series based on data
   */
  public static getSeriesColorScale(dataContainer: FlChartMultiSerie<any>): FlChartScaleColorMulti {
    return new FlChartScaleColorMulti(dataContainer.series.map(d => d.key));
  }
}
