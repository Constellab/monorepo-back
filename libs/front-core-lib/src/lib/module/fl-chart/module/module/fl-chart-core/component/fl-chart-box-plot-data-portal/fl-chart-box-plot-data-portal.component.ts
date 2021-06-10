import {Component, Inject, OnInit} from '@angular/core';
import {FlChartBoxPlotData, flChartGetBoxPlotData} from '../../../../../model/fl-chart-box-plot-data.class';
import {FlChart2dSerie} from '../../../../../model/fl-chart-2d-serie.class';
import {FlChart2dDatum} from '../../../../../model/fl-chart-2d-data.class';
import {FlChartScaleColor} from '../../../../../model/fl-chart-scale-color.class';
import {FL_PORTAL_DATA} from '../../../../../../fl-portal/model/fl-portal.class';

export interface FlChartBoxPlotDataPortalInput {
  serie: FlChart2dSerie<FlChart2dDatum>;
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

  serie: FlChart2dSerie<FlChart2dDatum>;
  seriesColorScale: FlChartScaleColor;

  boxPlotData: FlChartBoxPlotData;

  constructor(@Inject(FL_PORTAL_DATA) input: FlChartBoxPlotDataPortalInput) {
    this.serie = input.serie;
    this.seriesColorScale = input.seriesColorScale;
  }

  ngOnInit(): void {
    this.boxPlotData = flChartGetBoxPlotData(this.serie.getData().map(d => d.getY().valueOf()));
  }

}
