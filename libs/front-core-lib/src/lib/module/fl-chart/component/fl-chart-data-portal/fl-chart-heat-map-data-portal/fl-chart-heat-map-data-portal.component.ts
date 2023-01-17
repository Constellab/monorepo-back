import {Component, Inject, OnInit} from '@angular/core';
import {FL_PORTAL_DATA} from '../../../../fl-portal/model/fl-portal.class';
import {FlChart3dDatum} from '../../../model/data/fl-chart-data.class';
import {FlChartLabelFormatter} from '../../../model/fl-chart-label-formatter.class';

export interface FlChartHeatMapDataPortalInput {
  data: FlChart3dDatum;
  xLabelFormatter: FlChartLabelFormatter;
  yLabelFormatter: FlChartLabelFormatter;
}

@Component({
  selector: 'fl-chart-heat-map-data-portal',
  templateUrl: './fl-chart-heat-map-data-portal.component.html',
  styleUrls: ['./fl-chart-heat-map-data-portal.component.scss']
})
export class FlChartHeatMapDataPortalComponent implements OnInit {

  data: FlChart3dDatum;

  x: string;
  y: string;
  z: number;

  constructor(@Inject(FL_PORTAL_DATA) input: FlChartHeatMapDataPortalInput) {
    this.data = input.data;
    this.x = input.xLabelFormatter.formatShort(input.data.getX());
    this.y = input.yLabelFormatter.formatShort(input.data.getY());
    this.z = input.data.getZ();
  }

  ngOnInit(): void {
  }

}
