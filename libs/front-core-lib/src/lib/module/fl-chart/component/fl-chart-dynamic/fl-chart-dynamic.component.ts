import {Component, ElementRef, Input, OnInit, ViewChild} from '@angular/core';
import {FlChartComponentType} from '../../model/fl-chart-component.class';
import {FlChartSvg} from '../../model/fl-chart-svg.class';
import {FlChartContainer2d} from '../../model/fl-chart-container.class';
import {FlChart2dMultipleSerie} from '../../model/fl-chart-2d-serie.class';
import {MultiSerieData} from '../../model/data';
import {FlChartFactory} from '../../util/fl-chart.factory';
import {FlChartScaleColorMulti} from '../../model/fl-chart-scale-color.class';

@Component({
  selector: 'fl-chart-dynamic',
  templateUrl: './fl-chart-dynamic.component.html',
  styleUrls: ['./fl-chart-dynamic.component.scss']
})
export class FlChartDynamicComponent implements OnInit {

  @ViewChild('chart', {static: true}) chartHtmlContainer: ElementRef<HTMLElement>;

  @Input() data: FlChart2dMultipleSerie<any>;

  @Input() chartType: FlChartComponentType;

  seriesColorScale: FlChartScaleColorMulti;

  private chartSVG: FlChartSvg;
  private chartContainer: FlChartContainer2d<FlChart2dMultipleSerie<MultiSerieData>>;

  constructor() {
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
    this.chartSVG.downloadSVG();
  }

  resetZoom(): void {
    this.chartContainer.resetZoom();
  }
}
