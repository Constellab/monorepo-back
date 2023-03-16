import {AfterViewInit, Component, Host, Input, OnInit} from '@angular/core';
import { MatSelect } from '@angular/material/select';
import {
  FlEmbeddedOptionsAbstractDirective
} from '../../../../abstract-directive/fl-embedded-options-abstract.directive';
import {FlChartType, flChartTypeIcons} from '../../model/fl-chart.class';

/**
 * Component to place inside a mat-select to add the option of available charts
 */
@Component({
  selector: 'fl-chart-type-select-options',
  templateUrl: './fl-chart-type-select-options.component.html',
  styleUrls: ['./fl-chart-type-select-options.component.scss']
})
export class FlChartTypeSelectOptionsComponent extends FlEmbeddedOptionsAbstractDirective
  implements OnInit, AfterViewInit {

  @Input() availableChartTypes: FlChartType[];

  chartTypeIcons: Record<FlChartType, string> = flChartTypeIcons;

  constructor(@Host() private select: MatSelect) {
    super(select);
  }

  ngOnInit(): void {
    if (this.availableChartTypes == null) {
      this.availableChartTypes = [
        FlChartType.LINE, FlChartType.SCATTER_PLOT, FlChartType.BAR_PLOT,
        FlChartType.HISTOGRAM, FlChartType.STACKED_PLOT, FlChartType.BOX_PLOT,
        FlChartType.HEAT_MAP, FlChartType.VENN_DIAGRAM,
      ];
    }
  }

  ngAfterViewInit(): void {
    this.initOptions();
  }

}
