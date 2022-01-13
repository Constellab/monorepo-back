import {Component, Inject, OnInit} from '@angular/core';
import {FL_PORTAL_DATA} from '../../../fl-portal/model/fl-portal.class';

export interface FlChartHeatMapDataPortalInput {
  x: any;
  y: any;
  z: any;
}

@Component({
  selector: 'fl-chart-heat-map-data-portal',
  templateUrl: './fl-chart-heat-map-data-portal.component.html',
  styleUrls: ['./fl-chart-heat-map-data-portal.component.scss']
})
export class FlChartHeatMapDataPortalComponent implements OnInit {

  data: FlChartHeatMapDataPortalInput;

  constructor(@Inject(FL_PORTAL_DATA) input: FlChartHeatMapDataPortalInput) {
    this.data = input;
  }

  ngOnInit(): void {
  }

}
