import {Component, Inject, OnInit, ViewChild} from '@angular/core';
import {FlChartBoxPlotData} from '../../../model/data/fl-chart-box-plot-data.class';
import {FL_PORTAL_DATA} from '../../../../fl-portal/model/fl-portal.class';
import {FlChartDataWithSerie} from '../../../model/data/fl-chart-serie.class';
import {FlTagColorer} from '../../../../fl-tag/fl-tag-colorer.class';
import {MatMenuTrigger} from '@angular/material/menu';

export interface FlChartBoxPlotDataPortalInput {
  data: FlChartDataWithSerie<FlChartBoxPlotData>;
  color: string;
  tagColorer: FlTagColorer;
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

  color: string;

  boxPlotData: FlChartBoxPlotData;

  tagColorer?: FlTagColorer;
  @ViewChild(MatMenuTrigger, {static: true}) matMenuTrigger: MatMenuTrigger;

  constructor(@Inject(FL_PORTAL_DATA) input: FlChartBoxPlotDataPortalInput) {
    this.data = input.data;
    this.boxPlotData = input.data.data;
    this.color = input.color;
    this.tagColorer = input.tagColorer;
  }

  ngOnInit(): void {
  }

}
