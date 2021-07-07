import {Component, Inject, OnInit} from '@angular/core';
import {FL_PORTAL_DATA} from '../../../fl-portal/model/fl-portal.class';
import {FlChart3dDatum} from '../../model/data/fl-chart-data.class';

@Component({
  selector: 'fl-fl-chart-heat-map-data-portal',
  templateUrl: './fl-chart-heat-map-data-portal.component.html',
  styleUrls: ['./fl-chart-heat-map-data-portal.component.scss']
})
export class FlChartHeatMapDataPortalComponent implements OnInit {

  data: FlChart3dDatum;

  constructor(@Inject(FL_PORTAL_DATA) input: FlChart3dDatum) {
    this.data = input;
  }

  ngOnInit(): void {
  }

}
