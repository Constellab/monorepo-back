import {FlChartSvg} from '../model/drawer/fl-chart-svg.class';
import {FlChartType} from '../model/fl-chart.class';
import {FlChartContainer2Axis, FlChartContainerNoAxis} from '../model/drawer/fl-chart-container.class';
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
import {FlChartRendererLine} from '../renderer/fl-chart-renderer-line.plot';
import {FlChartRendererBarPlot} from '../renderer/fl-chart-renderer-bar.plot';
import {FlChart2dBrush, FlChart2dBrushX} from '../model/drawer/fl-chart-brush.class';
import {FlChartRendererBoxPlot} from '../renderer/fl-chart-renderer-box.plot';
import {FlChart2dMultiSerie, FlChartMultiSerie} from '../model/data/fl-chart-multi-serie.class';
import {FlChart2AxisRenderer} from '../renderer/fl-chart-renderer.class';
import {FlChartDomain} from '../model/fl-chart-domain.class';
import {FlChartRendererHeatMap} from '../renderer/fl-chart-renderer-heat-map.plot';
import {FlChart3dDatum} from '../model/data/fl-chart-data.class';
import {FlChartConfig} from '../model/fl-chart-config.class';
import {FlChartLegendHeatMap} from '../model/legend/fl-chart-legend-heat-map.class';
import {FlChartLegendMultiSeries, FlLegend} from '../model/legend/fl-chart-legend-multi-series.class';
import {FlChartRendererStackedBarPlot} from '../renderer/fl-chart-renderer-stacked-bar.plot';
import {FlChartBoxPlotData} from '../model/data/fl-chart-box-plot-data.class';
import {FlChartRendererVennDiagram} from '../renderer/fl-chart-renderer-venn-diagram.plot';
import {FlChartVennData} from '../model/data/fl-chart-venn-data.class';

export class FlChartFactory {


  public static getChartConfig(chartSVG: FlChartSvg, data: any, chartType: FlChartType)
    : FlChartConfig {

    switch (chartType) {
      case FlChartType.LINE:
        return this.getLineConfig(chartSVG, data);
      case FlChartType.SCATTER_PLOT:
        return this.getScatterPlotConfig(chartSVG, data);
      case FlChartType.BAR_PLOT:
        return this.getBarPlotConfig(chartSVG, data);
      case FlChartType.HISTOGRAM:
        return this.getHistogramPlotConfig(chartSVG, data);
      case FlChartType.STACKED_PLOT:
        return this.getStackedBarPlotConfig(chartSVG, data);
      case FlChartType.BOX_PLOT:
        return this.getBoxPlotConfig(chartSVG, data);
      case FlChartType.HEAT_MAP:
        return this.getHeatMapConfig(chartSVG, data);
      case FlChartType.VENN_DIAGRAM:
        return this.getVennDiagramConfig(chartSVG, data);
    }

    throw new Error('Unsupported chart type ' + chartType);

  }

  /**
   * Build a Scatter Plot multi container
   */
  private static getScatterPlotConfig(chartSVG: FlChartSvg, dataContainer: FlChart2dMultiSerie<any>)
    : FlChartConfig {

    const seriesColorScale = FlChartFactory.getMultiSeriesColorScale(dataContainer);

    const renderer = new FlChartRendererScatterPlot(seriesColorScale);

    return this.buildLinear2dMultiContainer(chartSVG, dataContainer, [renderer], seriesColorScale, 0.5);
  }

  /**
   * Build a Line multi container
   */
  private static getLineConfig(chartSVG: FlChartSvg, dataContainer: FlChart2dMultiSerie<any>)
    : FlChartConfig {
    const seriesColorScale = FlChartFactory.getMultiSeriesColorScale(dataContainer);

    const renderer = new FlChartRendererLine(seriesColorScale);

    // also use a scatter plot renderer to show point on the line
    const scatterPlot = new FlChartRendererScatterPlot(seriesColorScale);


    return this.buildLinear2dMultiContainer(chartSVG, dataContainer, [renderer, scatterPlot], seriesColorScale);
  }

  private static getBarPlotConfig(chartSVG: FlChartSvg, dataContainer: FlChart2dMultiSerie<any>): FlChartConfig {

    const seriesColorScale = FlChartFactory.getMultiSeriesColorScale(dataContainer);

    return this.getGenericBarPlotConfig(chartSVG, dataContainer,
      [new FlChartRendererBarPlot(seriesColorScale)],
      dataContainer.getDomainYLinear(0, 0),
      seriesColorScale,
      FlChartAxisBand.tickCharacterWidth * 3);
  }

  private static getHistogramPlotConfig(chartSVG: FlChartSvg, dataContainer: FlChart2dMultiSerie<any>): FlChartConfig {

    const seriesColorScale = FlChartFactory.getMultiSeriesColorScale(dataContainer);

    return this.getGenericBarPlotConfig(chartSVG, dataContainer,
      [new FlChartRendererBarPlot(seriesColorScale)],
      dataContainer.getDomainYLinear(0, 0),
      seriesColorScale,
      50);
  }

  private static getStackedBarPlotConfig(chartSVG: FlChartSvg, dataContainer: FlChart2dMultiSerie<any>): FlChartConfig {

    const seriesColorScale = FlChartFactory.getMultiSeriesColorScale(dataContainer);

    return this.getGenericBarPlotConfig(chartSVG, dataContainer,
      [new FlChartRendererStackedBarPlot(seriesColorScale)],
      dataContainer.getDomainYStacked(0, 0),
      seriesColorScale,
      FlChartAxisBand.tickCharacterWidth * 3);
  }

  /**
   *
   * Build a Bar plot multi container
   */
  private static getGenericBarPlotConfig(chartSVG: FlChartSvg, dataContainer: FlChart2dMultiSerie<any>,
                                         renderers: FlChart2AxisRenderer<FlChart2dMultiSerie<any>>[],
                                         yDomain: number[],
                                         seriesColorScale: FlChartScaleColor,
                                         xTickSize?: number): FlChartConfig {

    const chartContainer: FlChartContainer2Axis<FlChart2dMultiSerie<any>> = this.getChartContainer2Axis(chartSVG);

    // build the x axis and scale based on ScaleBand
    const xScale: FlChartScaleBand = new FlChartScaleBand()
      .setInitialDomain(dataContainer.getDomainXComplete())
      .range(chartContainer.getRangeX());
    const xAxis: FlChartAxisBand = new FlChartAxisBand('bottom').setScale(xScale);

    if (xTickSize != null) {
      xAxis.setSmartTickFormat(xTickSize, dataContainer.axisXLabelFormat);
    } else {
      xAxis.setTickFormat(dataContainer.axisXLabelFormat);
    }

    // build the y axis and scale linear
    const yScale: FlChartScaleLinear = new FlChartScaleNumber()
      .setInitialDomain(yDomain)
      .range(chartContainer.getRangeY());
    const yAxis: FlChartAxis = new FlChartAxis('left').setScale(yScale);

    // Activate brush only on X axis before the data init so the brush doesn't prevent hover events
    new FlChart2dBrushX(chartContainer);

    chartContainer
      .initXAxis(xAxis)
      .initAxisY(yAxis)
      .addRenderer(renderers)
      .initData(dataContainer);

    return {
      chartContainer: chartContainer,
      legend: new FlChartLegendMultiSeries(chartSVG.legendContainer, chartSVG.width, chartSVG.height,
        dataContainer.series, seriesColorScale),
      zoomEnabled: true
    };
  }


  /**
   * Build a Box plot multi container
   */
  private static getBoxPlotConfig(chartSVG: FlChartSvg, dataContainer: FlChartMultiSerie<FlChartBoxPlotData>)
    : FlChartConfig {

    const chartContainer: FlChartContainer2Axis<FlChartMultiSerie<any>> = this.getChartContainer2Axis(chartSVG);

    // build the x axis and scale based on ScaleBand
    // the x domain is an array of the number of series with index of the serie
    const xScale: FlChartScale = new FlChartScaleBand()
      .setInitialDomain(dataContainer.getBiggestSerieDomainCompleteIndexes())
      .range(chartContainer.getRangeX())
      .paddingOuter(0.3);
    const xAxis: FlChartAxis = new FlChartAxis('bottom').setScale(xScale)
      .setTickFormat(() => ''); // no info in x abscissa

    xAxis.setTickFormat((dataContainer).axisXLabelFormat);


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

    const seriesColorScale = FlChartFactory.getMultiSeriesColorScale(dataContainer);

    chartContainer
      .initXAxis(xAxis)
      .initAxisY(yAxis)
      .addRenderer(new FlChartRendererBoxPlot(seriesColorScale))
      .initData(dataContainer);

    return {
      chartContainer: chartContainer,
      legend: new FlChartLegendMultiSeries(chartSVG.legendContainer, chartSVG.width, chartSVG.height,
        dataContainer.series, seriesColorScale),
      zoomEnabled: true
    };
  }

  /**
   * Build a linear multi chart container such as ScatterPlot Multi of Line Multi
   */
  private static buildLinear2dMultiContainer(chartSVG: FlChartSvg, dataContainer: FlChart2dMultiSerie<any>,
                                             renderers: FlChart2AxisRenderer<FlChart2dMultiSerie<any>>[],
                                             colorScale: FlChartScaleColor,
                                             extendDomain: number = 0):
    FlChartConfig {
    const chartContainer: FlChartContainer2Axis<FlChart2dMultiSerie<any>> = this.getChartContainer2Axis(chartSVG);

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
        dataContainer.series, colorScale),
      zoomEnabled: true
    };
  }

  /**
   * Build a heat map container
   */
  private static getHeatMapConfig(chartSVG: FlChartSvg, dataContainer: FlChart2dMultiSerie<FlChart3dDatum>):
    FlChartConfig {

    const chartContainer: FlChartContainer2Axis<FlChart2dMultiSerie<FlChart3dDatum>> = this.getChartContainer2Axis(chartSVG);

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

  /**
   * Build a venn diagram container
   */
  private static getVennDiagramConfig(chartSVG: FlChartSvg, dataContainer: FlChartVennData):
    FlChartConfig {

    const chartContainer: FlChartContainerNoAxis<FlChartVennData> = this.getChartContainerNoAxis(chartSVG);

    const colorScale: FlChartScaleColor = new FlChartScaleColorMulti(dataContainer.groupNames);

    chartContainer
      .addRenderer(new FlChartRendererVennDiagram(colorScale))
      .initData(dataContainer);

    // create the legend object where key = name = groupName
    const legends: FlLegend[] = dataContainer.groupNames.map(groupName => ({name: groupName, key: groupName}));

    return {
      chartContainer: chartContainer,
      legend: new FlChartLegendMultiSeries(chartSVG.legendContainer, chartSVG.width, chartSVG.height,
        legends, colorScale),
      zoomEnabled: false
    };
  }


  private static getChartContainer2Axis(chartSVG: FlChartSvg): FlChartContainer2Axis<any> {
    return new FlChartContainer2Axis(chartSVG.chartContainer, chartSVG.chartContainerWidth, chartSVG.chartContainerHeight);
  }

  private static getChartContainerNoAxis(chartSVG: FlChartSvg): FlChartContainerNoAxis<any> {
    return new FlChartContainerNoAxis<any>(chartSVG.chartContainer, chartSVG.chartContainerWidth, chartSVG.chartContainerHeight);
  }

  /**
   * Build a basic color scale for series based on data
   */
  public static getMultiSeriesColorScale(dataContainer: FlChartMultiSerie<any>): FlChartScaleColorMulti {
    return new FlChartScaleColorMulti(dataContainer.series.map(d => d.key));
  }
}
