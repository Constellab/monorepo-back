import {Component, OnInit} from '@angular/core';
import {FlChartRightSectionDirective} from '../fl-chart-right-section.directive';
import {FlChartSerieWithColor} from '../../../model/data/fl-chart-serie.class';

/**
 * Component to display legend for multi series chart
 */
@Component({
  selector: 'fl-chart-legend-multi-series',
  templateUrl: './fl-chart-legend-multi-series.component.html',
  styleUrls: ['./fl-chart-legend-multi-series.component.scss']
})
export class FlChartLegendMultiSeriesComponent extends FlChartRightSectionDirective<FlChartSerieWithColor[]>
  implements OnInit {

  ngOnInit(): void {
  }

}
