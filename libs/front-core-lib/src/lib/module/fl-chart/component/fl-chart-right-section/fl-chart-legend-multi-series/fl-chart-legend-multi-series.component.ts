import {Component, Input, OnInit} from '@angular/core';
import {FlChartRightSectionDirective} from '../fl-chart-right-section.directive';
import {FlChartSerieSimple} from '../../../model/data/fl-chart-serie.class';
import {FlChartScaleColor} from '../../../model/scale/fl-chart-scale-color.class';

export interface FlChartLegendMultiSeriesInput {
  series: FlChartSerieSimple[];
  seriesColorScale: FlChartScaleColor;
}

/**
 * Component to display legend for multi series chart
 */
@Component({
  selector: 'fl-chart-legend-multi-series',
  templateUrl: './fl-chart-legend-multi-series.component.html',
  styleUrls: ['./fl-chart-legend-multi-series.component.scss']
})
export class FlChartLegendMultiSeriesComponent extends FlChartRightSectionDirective<FlChartLegendMultiSeriesInput>
  implements OnInit {

  // when disable the color is replace with a grey color
  @Input() disableLegends: boolean = false;

  ngOnInit(): void {
  }

}
