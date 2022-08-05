import {ChangeDetectionStrategy, Component, Inject, OnInit} from '@angular/core';
import {FL_PORTAL_DATA} from '../../../../fl-portal/model/fl-portal.class';
import {FlChartDataWithSerie} from '../../../model/data/fl-chart-serie.class';
import {FlChart2dDatum} from '../../../model/data/fl-chart-data.class';
import {FlTagColorer} from '../../../../fl-tag/fl-tag-colorer.class';

export interface FlChartDataWithSeriePortalInput {
  data: FlChartDataWithSerie<FlChart2dDatum>;
  color: string;
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
  color: string;
  tagColorer?: FlTagColorer;

  constructor(@Inject(FL_PORTAL_DATA) input: FlChartDataWithSeriePortalInput) {
    this.data = input.data;
    this.color = input.color;
    this.tagColorer = input.tagColorer;
  }

  ngOnInit(): void {
  }

}
