import {Component, Inject, OnInit} from '@angular/core';
import {Numeric} from 'd3';
import {FlChartDataWithSerie} from '../../../model/data/fl-chart-serie.class';
import {FL_PORTAL_DATA} from '../../../../fl-portal/model/fl-portal.class';
import {FlChartDataBin} from '../../../model/data/fl-chart-data-bin.class';

export interface FlChartBinDataPortalInput {
  data: FlChartDataWithSerie<FlChartDataBin>;
  color: string;
}


/**
 * Portal to display a bin data
 */
@Component({
  selector: 'fl-chart-bin-data-portal',
  templateUrl: './fl-chart-bin-data-portal.component.html',
  styleUrls: ['./fl-chart-bin-data-portal.component.scss']
})
export class FlChartBinDataPortalComponent implements OnInit {

  y: Numeric;
  intervalText: string;

  serieName: string;
  serieKey: number;
  color: string;

  constructor(@Inject(FL_PORTAL_DATA) private input: FlChartBinDataPortalInput) {
    const bin = input.data.data;
    this.y = bin.getY();
    this.intervalText = bin.getIntervalText();
    this.serieName = input.data.serieName;
    this.serieKey = input.data.serieKey;
    this.color = input.color;
  }

  ngOnInit(): void {
  }

}
