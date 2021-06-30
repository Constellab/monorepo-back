import {Component, Inject, OnInit} from '@angular/core';
import {FL_PORTAL_DATA} from '../../../../../../fl-portal/model/fl-portal.class';
import {FlChartDataWithSerie} from '../../../../../model/data/fl-chart-2d-serie.class';
import {FlChartScaleColor} from '../../../../../model/fl-chart-scale-color.class';

export interface FlChartDataWithSeriePortalInput {
  data: FlChartDataWithSerie;
  seriesColorScale: FlChartScaleColor;
}

@Component({
  selector: 'fl-chart-data-with-serie-portal',
  templateUrl: './fl-chart-data-with-serie-portal.component.html',
  styleUrls: ['./fl-chart-data-with-serie-portal.component.scss']
})
export class FlChartDataWithSeriePortalComponent implements OnInit {

  data: FlChartDataWithSerie;
  seriesColorScale: FlChartScaleColor;

  constructor(@Inject(FL_PORTAL_DATA) input: FlChartDataWithSeriePortalInput) {
    this.data = input.data;
    this.seriesColorScale = input.seriesColorScale;
  }

  ngOnInit(): void {
  }

}
