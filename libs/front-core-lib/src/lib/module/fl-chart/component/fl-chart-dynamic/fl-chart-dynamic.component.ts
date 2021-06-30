import {Component, ElementRef, Input, OnInit, ViewChild} from '@angular/core';
import {FlChartComponentType} from '../../model/fl-chart-component.class';
import {FlChartSvg} from '../../model/fl-chart-svg.class';
import {FlChartContainer2d} from '../../model/fl-chart-container.class';
import {FlChartFactory} from '../../util/fl-chart.factory';
import {FlChartScaleColorMulti} from '../../model/fl-chart-scale-color.class';
import {FlThemeService} from '../../../../service/fl-theme.service';
import {FlChart2dMultiSerie} from '../../model/data/fl-chart-2d-multi-serie.class';

@Component({
  selector: 'fl-chart-dynamic',
  templateUrl: './fl-chart-dynamic.component.html',
  styleUrls: ['./fl-chart-dynamic.component.scss']
})
export class FlChartDynamicComponent implements OnInit {

  @ViewChild('chart', {static: true}) chartHtmlContainer: ElementRef<HTMLElement>;

  @Input() data: FlChart2dMultiSerie<any>;

  @Input() chartType: FlChartComponentType;

  seriesColorScale: FlChartScaleColorMulti;

  private chartSVG: FlChartSvg;
  private chartContainer: FlChartContainer2d<FlChart2dMultiSerie<any>>;

  constructor(private themeService: FlThemeService) {
  }

  ngOnInit(): void {
    this.initChart();
  }

  private initChart(): void {
    this.chartSVG = new FlChartSvg(460, 400).initSvg(this.chartHtmlContainer.nativeElement);
    this.seriesColorScale = FlChartFactory.getSeriesColorScale(this.data);
    this.chartContainer = FlChartFactory.buildChart2dContainer(this.chartSVG, this.data, this.chartType, this.seriesColorScale);
  }

  downloadSVG(): void {
    this.chartSVG.downloadSVG(this.themeService.isDarkTheme());
  }

  resetZoom(): void {
    this.chartContainer.resetZoom();
  }
}
