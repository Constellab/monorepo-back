import {AfterViewInit, Component, Host, OnInit} from '@angular/core';
import {MatSelect} from '@angular/material/select';
import {FlEmbeddedOptionsAbstractDirective} from '../../../../abstract-directive/fl-embedded-options-abstract.directive';
import {FlChartTypeSelectOption, flChartTypeSelectOptions} from '../../model/fl-chart.class';

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

  charts: FlChartTypeSelectOption[] = flChartTypeSelectOptions;

  constructor(@Host() private select: MatSelect) {
    super(select);
  }

  ngOnInit(): void {
  }

  ngAfterViewInit(): void {
    this.initOptions();
  }

}
