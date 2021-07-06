import {Injectable} from '@angular/core';
import {FlChartSvg} from '../model/fl-chart-svg.class';
import {FlChartContainer2d} from '../model/fl-chart-container.class';
import {FlChartMultiSerie} from '../model/data/fl-chart-multi-serie.class';
import {FlChartScaleColorMulti} from '../model/fl-chart-scale-color.class';
import {FlThemeService} from '../../../service/fl-theme.service';
import {FlChartType} from '../model/fl-chart.class';
import {FlChartFactory} from '../util/fl-chart.factory';


@Injectable()
export class FlChartState {


  public chartSVG: FlChartSvg;
  public chartContainer: FlChartContainer2d<FlChartMultiSerie<any>>;

  public seriesColorScale: FlChartScaleColorMulti;

  public dataContainer: FlChartMultiSerie<any>;

  constructor(private themeService: FlThemeService) {
  }

  public initData(data: FlChartMultiSerie<any>): void {
    this.dataContainer = data;
    this.seriesColorScale = FlChartFactory.getSeriesColorScale(data);
  }

  public initChart(width: number, height: number, container: HTMLElement,
              chartType: FlChartType): void {
    this.chartSVG = new FlChartSvg(width, height).initSvg(container);
    this.chartContainer = FlChartFactory.buildChart2dContainer(this.chartSVG, this.dataContainer, chartType, this.seriesColorScale);
  }


  public downloadSVG(): void {
    this.chartSVG.downloadSVG(this.themeService.isDarkTheme());
  }

  public resetZoom(): void {
    this.chartContainer.resetZoom();
  }

  public getSerieColor(serieKey: number): string {
    return this.seriesColorScale.scale(serieKey);
  }
}
