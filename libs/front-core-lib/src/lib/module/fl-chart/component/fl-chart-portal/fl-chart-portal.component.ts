import {Component, Inject, OnInit} from '@angular/core';
import {FL_PORTAL_DATA} from '../../../fl-portal/model/fl-portal.class';
import {FlChartPortalConfig} from '../../model/fl-chart.class';

@Component({
  selector: 'fl-chart-portal',
  templateUrl: './fl-chart-portal.component.html',
  styleUrls: ['./fl-chart-portal.component.scss']
})
export class FlChartPortalComponent implements OnInit {

  config: FlChartPortalConfig;

  constructor(@Inject(FL_PORTAL_DATA) config: FlChartPortalConfig) {
    this.config = config;
  }

  ngOnInit(): void {
  }

}
