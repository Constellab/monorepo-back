import {Component, Inject, OnInit} from '@angular/core';
import {FL_PORTAL_DATA} from '../../../fl-portal/model/fl-portal.class';
import {FlChartDynamicConfig} from '../../model/fl-chart-component.class';

@Component({
  selector: 'fl-chart-dynamic-portal',
  templateUrl: './fl-chart-dynamic-portal.component.html',
  styleUrls: ['./fl-chart-dynamic-portal.component.scss']
})
export class FlChartDynamicPortalComponent implements OnInit {

  config: FlChartDynamicConfig;

  constructor(@Inject(FL_PORTAL_DATA) config: FlChartDynamicConfig) {
    this.config = config;
  }

  ngOnInit(): void {
  }

}
