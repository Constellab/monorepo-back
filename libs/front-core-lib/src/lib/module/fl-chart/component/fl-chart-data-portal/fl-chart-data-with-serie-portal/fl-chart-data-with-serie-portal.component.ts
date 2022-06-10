import {ChangeDetectionStrategy, Component, Inject, OnInit} from '@angular/core';
import {FL_PORTAL_DATA} from '../../../../fl-portal/model/fl-portal.class';
import {FlChartDataWithSerie} from '../../../model/data/fl-chart-serie.class';
import {FlChartScaleColor} from '../../../model/scale/fl-chart-scale-color.class';
import {FlChart2dDatum} from '../../../model/data/fl-chart-data.class';
import {FlTagColorer} from '../../../../fl-tag/fl-tag-colorer.class';

export interface FlChartDataWithSeriePortalInput {
  data: FlChartDataWithSerie<FlChart2dDatum>;
  seriesColorScale: FlChartScaleColor;
  tagColorer?: FlTagColorer;
}

/**
 * Simple portal to show a data with its serie.
 */
@Component({
  selector: 'fl-chart-data-with-serie-portal',
  templateUrl: './fl-chart-data-with-serie-portal.component.html',
  styleUrls: ['./fl-chart-data-with-serie-portal.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FlChartDataWithSeriePortalComponent implements OnInit {


  data: FlChartDataWithSerie<FlChart2dDatum>;
  seriesColorScale: FlChartScaleColor;
  tagColorer?: FlTagColorer;

  constructor(@Inject(FL_PORTAL_DATA) input: FlChartDataWithSeriePortalInput) {
    this.data = input.data;
    this.seriesColorScale = input.seriesColorScale;
    this.tagColorer = input.tagColorer;
  }

  ngOnInit(): void {
  }

}
