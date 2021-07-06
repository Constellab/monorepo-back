import {Component, Inject, OnInit} from '@angular/core';
import {FL_PORTAL_DATA} from '../../../fl-portal/model/fl-portal.class';
import {FlChartDynamicConfig} from '../../model/fl-chart.class';

@Component({
  selector: 'fl-chart-portal',
  templateUrl: './fl-chart-portal.component.html',
  styleUrls: ['./fl-chart-portal.component.scss']
})
export class FlChartPortalComponent implements OnInit {

  config: FlChartDynamicConfig;

  constructor(@Inject(FL_PORTAL_DATA) config: FlChartDynamicConfig) {
    this.config = config;
  }

  ngOnInit(): void {
  }

}
