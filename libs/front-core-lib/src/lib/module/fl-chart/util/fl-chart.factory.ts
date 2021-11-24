import {FlChartSvg} from '../model/drawer/fl-chart-svg.class';
import {FlChartType} from '../model/fl-chart.class';
import {FlChartContainer2d} from '../model/drawer/fl-chart-container.class';
import {
  FlChartScale,
  FlChartScaleBand,
  FlChartScaleLinear,
  FlChartScaleNumber
} from '../model/scale/fl-chart-scale.class';
import {FlChartAxis, FlChartAxisBand} from '../model/drawer/fl-chart-axis.class';
import {FlChartRendererScatterPlot} from '../renderer/fl-chart-renderer-scatter.plot';
import {
  FlChartScaleColor,
  FlChartScaleColorLinear,
  FlChartScaleColorMulti
} from '../model/scale/fl-chart-scale-color.class';
import {FlChartRendererLine} from '../renderer/fl-chart-renderer.line';
import {FlChartRendererBarPlot} from '../renderer/fl-chart-renderer-bar.plot';
import {FlChart2dBrush, FlChart2dBrushX} from '../model/drawer/fl-chart-brush.class';
import {FlChartRendererBoxPlot} from '../renderer/fl-chart-renderer-box.plot';
import {FlChart2dMultiSerie, FlChartMultiSerie} from '../model/data/fl-chart-multi-serie.class';
import {FlChart2dRenderer} from '../renderer/fl-chart-2d-renderer.class';
import {FlChartDomain} from '../model/fl-chart-domain.class';
import {FlChartRendererHeatMap} from '../renderer/fl-chart-renderer-heat.map';
import {FlChart3dDatum} from '../model/data/fl-chart-data.class';
import {FlChartConfig} from '../model/fl-chart-config.class';
import {FlChartLegendHeatMap} from '../model/legend/fl-chart-legend-heat-map.class';
import {FlChartLegendMultiSeries} from '../model/legend/fl-chart-legend-multi-series.class';
import {FlChartRendererStackedBarPlot} from '../renderer/fl-chart-renderer-stacked-bar.plot';
import {FlChartBoxPlotData} from '../model/data/fl-chart-box-plot-data.class';

export class FlChartFactory {


  public static getChartConfig(chartSVG: FlChartSvg, data: FlChartMultiSerie<any>,
                               chartType: FlChartType, seriesColorScale: FlChartScaleColor)
    : FlChartConfig {

    switch (chartType) {
      case FlChartType.LINE:
        return this.getLineConfig(chartSVG, data as FlChart2dMultiSerie<any>, seriesColorScale);
      case FlChartType.SCATTER_PLOT:
        return this.getScatterPlotConfig(chartSVG, data as FlChart2dMultiSerie<any>, seriesColorScale);
      case FlChartType.BAR_PLOT:
        return this.getBarPlotConfig(chartSVG, data as FlChart2dMultiSerie<any>, seriesColorScale,
          FlChartAxisBand.tickCharacterWidth * 3);
      case FlChartType.HISTOGRAM:
        return this.getBarPlotConfig(chartSVG, data as FlChart2dMultiSerie<any>, seriesColorScale, 50);
      case FlChartType.STACKED_PLOT:
        return this.getStackBarConfig(chartSVG, data as FlChart2dMultiSerie<any>, seriesColorScale,
          FlChartAxisBand.tickCharacterWidth * 3);
      case FlChartType.BOX_PLOT:
        return this.getBoxPlotConfig(chartSVG, data, seriesColorScale);
      case FlChartType.HEAT_MAP:
        return this.getHeatMapConfig(chartSVG, data as FlChart2dMultiSerie<any>);
    }

    throw new Error('Unsupported chart type ' + chartType);

  }

  /**
   * Build a Scatter Plot multi container
   */
  private static getScatterPlotConfig(chartSVG: FlChartSvg, dataContainer: FlChart2dMultiSerie<any>,
                                      seriesColorScale: FlChartScaleColor)
    : FlChartConfig {

    const renderer = new FlChartRendererScatterPlot(seriesColorScale);

    return this.buildLinear2dMultiContainer(chartSVG, dataContainer, [renderer], seriesColorScale, 0.5);
  }

  /**
   * Build a Line multi container
   */
  private static getLineConfig(chartSVG: FlChartSvg, dataContainer: FlChart2dMultiSerie<any>,
                               seriesColorScale: FlChartScaleColor)
    : FlChartConfig {
    const renderer = new FlChartRendererLine(seriesColorScale);

    // also use a scatter plot renderer to show point on the line
    const scatterPlot = new FlChartRendererScatterPlot(seriesColorScale);


    return this.buildLinear2dMultiContainer(chartSVG, dataContainer, [renderer, scatterPlot], seriesColorScale);
  }

  /**
   * Build a Bar plot multi container
   */
  private static getBarPlotConfig(chartSVG: FlChartSvg, dataContainer: FlChart2dMultiSerie<any>,
                                  seriesColorScale: FlChartScaleColor, xTickSize?: number)
    : FlChartConfig {

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
      .setInitialDomain(dataContainer.getDomainYLinear(0, 0))
      .range(chartContainer.getRangeY());
    const yAxis: FlChartAxis = new FlChartAxis('left').setScale(yScale);

    // Activate brush only on X axis before the data init so the brush doesn't prevent hover events
    new FlChart2dBrushX(chartContainer);

    chartContainer
      .initXAxis(xAxis)
      .initAxisY(yAxis)
      .addRenderer(new FlChartRendererBarPlot(seriesColorScale))
      .initData(dataContainer);

    return {
      chartContainer: chartContainer,
      legend: new FlChartLegendMultiSeries(chartSVG.legendContainer, chartSVG.width, chartSVG.height,
        dataContainer, seriesColorScale),
      zoomEnabled: true
    };
  }

  /**
   * Build a StackBar
   */
  private static getStackBarConfig(chartSVG: FlChartSvg, dataContainer: FlChart2dMultiSerie<any>,
                                   seriesColorScale: FlChartScaleColor, xTickSize?: number)
    : FlChartConfig {

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
      .setInitialDomain(dataContainer.getDomainYLinear(0, 0))
      .range(chartContainer.getRangeY());
    const yAxis: FlChartAxis = new FlChartAxis('left').setScale(yScale);

    // Activate brush only on X axis before the data init so the brush doesn't prevent hover events
    new FlChart2dBrushX(chartContainer);

    chartContainer
      .initXAxis(xAxis)
      .initAxisY(yAxis)
      .addRenderer(new FlChartRendererStackedBarPlot(seriesColorScale))
      .initData(dataContainer);

    return {
      chartContainer: chartContainer,
      legend: new FlChartLegendMultiSeries(chartSVG.legendContainer, chartSVG.width, chartSVG.height,
        dataContainer, seriesColorScale),
      zoomEnabled: true
    };
  }


  /**
   * Build a Box plot multi container
   */
  private static getBoxPlotConfig(chartSVG: FlChartSvg, dataContainer: FlChartMultiSerie<FlChartBoxPlotData>,
                                  seriesColorScale: FlChartScaleColor)
    : FlChartConfig {

    const chartContainer: FlChartContainer2d<FlChartMultiSerie<any>> = this.getChartContainer2d(chartSVG);

    // build the x axis and scale based on ScaleBand
    // the x domain is an array of the number of series with index of the serie
    const xScale: FlChartScale = new FlChartScaleBand()
      .setInitialDomain(dataContainer.getBiggestSerieDomainCompleteIndexes())
      .range(chartContainer.getRangeX())
      .paddingOuter(0.3);
    const xAxis: FlChartAxis = new FlChartAxis('bottom').setScale(xScale)
      .setTickFormat(() => ''); // no info in x abscissa

    xAxis.setTickFormat((dataContainer as any).axisXLabelFormat);



    const data = dataContainer.getData();
    const numberData: number[] = [];
    for (const d of data) {
      numberData.push(d.min, d.lowerWhisker, d.max, d.upperWhisker);
    }
    // build the y axis and scale linear
    const yScale: FlChartScaleLinear = new FlChartScaleNumber()
      .setInitialDomain(FlChartDomain.getLinearDomain(numberData, 0, 0))
      .range(chartContainer.getRangeY());
    const yAxis: FlChartAxis = new FlChartAxis('left').setScale(yScale);

    // Activate brush only on X axis before the data init so the brush doesn't prevent hover events
    new FlChart2dBrushX(chartContainer);

    chartContainer
      .initXAxis(xAxis)
      .initAxisY(yAxis)
      .addRenderer(new FlChartRendererBoxPlot(seriesColorScale))
      .initData(dataContainer);

    return {
      chartContainer: chartContainer,
      legend: new FlChartLegendMultiSeries(chartSVG.legendContainer, chartSVG.width, chartSVG.height,
        dataContainer, seriesColorScale),
      zoomEnabled: true
    };
  }

  /**
   * Build a linear multi chart container such as ScatterPlot Multi of Line Multi
   */
  private static buildLinear2dMultiContainer(chartSVG: FlChartSvg, dataContainer: FlChart2dMultiSerie<any>,
                                             renderers: FlChart2dRenderer<FlChart2dMultiSerie<any>>[],
                                             seriesColorScale: FlChartScaleColor,
                                             extendDomain: number = 0):
    FlChartConfig {
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


    return {
      chartContainer: chartContainer,
      legend: new FlChartLegendMultiSeries(chartSVG.legendContainer, chartSVG.width, chartSVG.height,
        dataContainer, seriesColorScale),
      zoomEnabled: true
    };
  }

  /**
   * Build a heat map container
   */
  private static getHeatMapConfig(chartSVG: FlChartSvg, dataContainer: FlChart2dMultiSerie<FlChart3dDatum>):
    FlChartConfig {

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
      .addRenderer(new FlChartRendererHeatMap(colorScale))
      .initData(dataContainer);

    // build legend
    const legend: FlChartLegendHeatMap = new FlChartLegendHeatMap(chartSVG.legendContainer, chartSVG.legendContainerWidth,
      chartSVG.legendContainerHeight, colorScale, domain);


    return {
      chartContainer: chartContainer,
      legend: legend,
      zoomEnabled: false
    };
  }


  private static getChartContainer2d(chartSVG: FlChartSvg): FlChartContainer2d<any> {
    return new FlChartContainer2d(chartSVG.chartContainer, chartSVG.chartContainerWidth, chartSVG.chartContainerHeight);
  }

  /**
   * Build a basic color scale for series based on data
   */
  public static getSeriesColorScale(dataContainer: FlChartMultiSerie<any>): FlChartScaleColorMulti {
    return new FlChartScaleColorMulti(dataContainer.series.map(d => d.key));
  }
}
