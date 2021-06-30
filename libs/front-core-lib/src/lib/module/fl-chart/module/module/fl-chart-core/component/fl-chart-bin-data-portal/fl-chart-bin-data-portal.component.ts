import {Component, Inject, OnInit} from '@angular/core';
import {Numeric} from 'd3';
import {FlChartDataWithSerie} from '../../../../../model/data/fl-chart-2d-serie.class';
import {FlChartScaleColor} from '../../../../../model/fl-chart-scale-color.class';
import {FL_PORTAL_DATA} from '../../../../../../fl-portal/model/fl-portal.class';
import {FlChartDataBin} from '../../../../../model/data/fl-chart-data-bin.class';

export interface FlChartBinDataPortalInput {
  data: FlChartDataWithSerie;
  seriesColorScale: FlChartScaleColor;
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
  data: number[];

  serieName: string;
  serieKey: number;
  seriesColorScale: FlChartScaleColor;

  constructor(@Inject(FL_PORTAL_DATA) private input: FlChartBinDataPortalInput) {
    const bin = input.data.data as FlChartDataBin;
    this.y = bin.getY();
    this.intervalText = bin.getIntervalText();
    this.data = bin.getSortedData();
    this.serieName = input.data.serieName;
    this.serieKey = input.data.serieKey;
    this.seriesColorScale = input.seriesColorScale;
  }

  ngOnInit(): void {
  }

}
