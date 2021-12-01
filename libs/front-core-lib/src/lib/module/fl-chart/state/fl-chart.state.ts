import {Injectable} from '@angular/core';
import {FlChartSvg} from '../model/drawer/fl-chart-svg.class';
import {FlChartContainer, FlChartContainer2Axis} from '../model/drawer/fl-chart-container.class';
import {FlThemeService} from '../../../service/fl-theme.service';
import {FlChartType} from '../model/fl-chart.class';
import {FlChartFactory} from '../util/fl-chart.factory';
import {FlChartConfig} from '../model/fl-chart-config.class';
import {FlChartLegend} from '../model/legend/fl-chart-legend.class';


@Injectable()
export class FlChartState {


  public chartSVG: FlChartSvg;
  public chartContainer: FlChartContainer<any>;
  public legend: FlChartLegend;


  public dataContainer: any;

  public chartType: FlChartType;

  public zoomEnabled: boolean;

  constructor(private themeService: FlThemeService) {
  }

  public initData(dataContainer: any, chartType: FlChartType): void {
    this.dataContainer = dataContainer;
    this.chartType = chartType;
  }

  public initChart(width: number, height: number, container: HTMLElement): void {
    this.chartSVG = new FlChartSvg(width, height).initSvg(container);
    const config: FlChartConfig = FlChartFactory.getChartConfig(this.chartSVG, this.dataContainer, this.chartType);
    this.chartContainer = config.chartContainer;
    this.legend = config.legend;
    this.zoomEnabled = config.zoomEnabled;

    this.renderChart();
  }

  private renderChart(): void {
    this.chartContainer.firstChartRendering();
    this.legend?.renderLegend();
  }


  public downloadSVG(): void {
    this.chartSVG.downloadSVG(this.themeService.isDarkTheme());
  }

  public resetZoom(): void {
    if (this.zoomEnabled) {
      (this.chartContainer as FlChartContainer2Axis<any>).resetZoom();
    }
  }
}
