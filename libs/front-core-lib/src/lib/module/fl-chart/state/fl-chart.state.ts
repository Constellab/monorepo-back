import {Injectable} from '@angular/core';
import {FlChartSvg} from '../model/drawer/fl-chart-svg.class';
import {FlChartContainer, FlChartContainer2d} from '../model/drawer/fl-chart-container.class';
import {FlChartMultiSerie} from '../model/data/fl-chart-multi-serie.class';
import {FlChartScaleColorMulti} from '../model/scale/fl-chart-scale-color.class';
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

  public seriesColorScale: FlChartScaleColorMulti;

  public dataContainer: FlChartMultiSerie<any>;

  public chartType: FlChartType;

  constructor(private themeService: FlThemeService) {
  }

  public initData(data: FlChartMultiSerie<any>, chartType: FlChartType): void {
    this.dataContainer = data;
    this.seriesColorScale = FlChartFactory.getSeriesColorScale(data);
    this.chartType = chartType;
  }

  public initChart(width: number, height: number, container: HTMLElement): void {
    this.chartSVG = new FlChartSvg(width, height).initSvg(container);
    const config: FlChartConfig = FlChartFactory.getChartConfig(this.chartSVG, this.dataContainer, this.chartType, this.seriesColorScale);
    this.chartContainer = config.chartContainer;
    this.legend = config.legend;

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
    if (this.isZoomable()) {
      (this.chartContainer as FlChartContainer2d<any>).resetZoom() ;
    }
  }

  public isZoomable(): boolean {
    return this.chartContainer instanceof FlChartContainer2d;
  }

  public getSerieColor(serieKey: number): string {
    return this.seriesColorScale.scale(serieKey);
  }
}
