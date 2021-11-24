import {Component, Inject, OnInit, ViewChild} from '@angular/core';
import {FlChartBoxPlotData} from '../../model/data/fl-chart-box-plot-data.class';
import {FlChartScaleColor} from '../../model/scale/fl-chart-scale-color.class';
import {FL_PORTAL_DATA} from '../../../fl-portal/model/fl-portal.class';
import {MatMenuTrigger} from '@angular/material/menu';
import {FlChartDataWithSerie} from '../../model/data/fl-chart-serie.class';

export interface FlChartBoxPlotDataPortalInput {
  data: FlChartDataWithSerie<FlChartBoxPlotData>;
  seriesColorScale: FlChartScaleColor;
}

/**
 * Display the box plot data in a portal
 */
@Component({
  selector: 'fl-chart-box-plot-data-portal',
  templateUrl: './fl-chart-box-plot-data-portal.component.html',
  styleUrls: ['./fl-chart-box-plot-data-portal.component.scss']
})
export class FlChartBoxPlotDataPortalComponent implements OnInit {

  data: FlChartDataWithSerie<FlChartBoxPlotData>;

  seriesColorScale: FlChartScaleColor;

  boxPlotData: FlChartBoxPlotData;
  @ViewChild(MatMenuTrigger, {static: true}) matMenuTrigger: MatMenuTrigger;

  constructor(@Inject(FL_PORTAL_DATA) input: FlChartBoxPlotDataPortalInput) {
    this.data = input.data;
    this.boxPlotData = input.data.data;
    this.seriesColorScale = input.seriesColorScale;
  }

  ngOnInit(): void {
  }

}
