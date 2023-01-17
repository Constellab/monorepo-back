import {ChangeDetectionStrategy, Component, Inject, OnInit} from '@angular/core';
import {FlChartDataWithSerie} from '../../../model/data/fl-chart-serie.class';
import {FlChart2dDatum} from '../../../model/data/fl-chart-data.class';
import {FlChartScaleColor} from '../../../model/scale/fl-chart-scale-color.class';
import {FL_PORTAL_DATA} from '../../../../fl-portal/model/fl-portal.class';
import {FlChartLabelFormatter} from '../../../model/fl-chart-label-formatter.class';

export interface FlChartStackedBarDataPortalInput {
  data: FlChartDataWithSerie<FlChart2dDatum>[];
  seriesColorScale: FlChartScaleColor;
  xLabelFormatter: FlChartLabelFormatter;
  yLabelFormatter: FlChartLabelFormatter;
}

/**
 * Portal to show all the value with series of a bar.
 */
@Component({
  selector: 'fl-chart-stacked-bar-data-portal',
  templateUrl: './fl-chart-stacked-bar-data-portal.component.html',
  styleUrls: ['./fl-chart-stacked-bar-data-portal.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FlChartStackedBarDataPortalComponent implements OnInit {

  x: number;

  xLabelFormatter: FlChartLabelFormatter;
  yLabelFormatter: FlChartLabelFormatter;

  data: FlChartDataWithSerie<FlChart2dDatum>[];
  seriesColorScale: FlChartScaleColor;

  constructor(@Inject(FL_PORTAL_DATA) input: FlChartStackedBarDataPortalInput) {
    this.data = input.data;
    this.seriesColorScale = input.seriesColorScale;

    // retrieve the x, all the values have the same X as it is one stacked bar
    if (this.data?.length > 0) {
      this.x = this.data[0].data.getX();
    }
    this.xLabelFormatter = input.xLabelFormatter;
    this.yLabelFormatter = input.yLabelFormatter;
  }


  ngOnInit(): void {
  }

}
