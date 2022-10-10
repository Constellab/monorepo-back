import {Injectable} from '@angular/core';
import {FlChartSvg} from '../model/drawer/fl-chart-svg.class';
import {FlChartContainer, FlChartContainer2Axis} from '../model/drawer/fl-chart-container.class';
import {FlThemeService} from '../../fl-theme/fl-theme.service';
import {FlChartConfig} from '../model/fl-chart-config.class';
import {FlChartBrush} from '../model/drawer/fl-chart-brush.class';


@Injectable()
export class FlChartState {

  public chartSVG: FlChartSvg;
  public chart: FlChartConfig;

  public chartContainer: FlChartContainer<any>;
  public zoomBrush?: FlChartBrush;

  constructor(private themeService: FlThemeService) {
  }

  public initData(chart: FlChartConfig): void {
    this.chart = chart;
  }

  public initChart(width: number, height: number, container: HTMLElement): void {
    this.chartSVG = new FlChartSvg();
    this.renderChart(width, height, container);
  }

  private renderChart(width: number, height: number, container: HTMLElement): void {
    this.chartContainer = this.chart.getChartContainer();

    // if the chart container has a size defined, use it to set the SVG size
    if (this.chartContainer.sizeIsSet()) {
      this.chartSVG.setSVGSize(this.chartContainer.groupWidth, this.chartContainer.groupHeight);
    } else {
      // otherwise, use the HTMLElement size
      this.chartSVG.setSVGSize(width, height);
      this.chartContainer.setGroupSize(this.chartSVG.chartContainerWidth, this.chartSVG.chartContainerHeight);
    }
    this.chartSVG.initSvg(container);

    // draw the chart container
    this.chartContainer.drawChartContainer(this.chartSVG.chartContainer);

    // init brush before rendering the charts, so it does not prevent the hover on renderer
    this.zoomBrush = this.chart.getZoomBrush();
    if (this.zoomBrush) {
      this.zoomBrush.initBrush(this.chartContainer as FlChartContainer2Axis<any>);
    }

    // render the chart
    this.chartContainer.firstChartRendering();
  }


  public downloadSVG(): void {
    const svgLegend = this.chart.getSVGLegend();
    this.chartSVG.downloadSVG(svgLegend, this.themeService.isDarkTheme());
  }

  public resetZoom(): void {
    if (this.zoomBrush) {
      (this.chartContainer as FlChartContainer2Axis<any>).resetZoom();
    }
  }
}
