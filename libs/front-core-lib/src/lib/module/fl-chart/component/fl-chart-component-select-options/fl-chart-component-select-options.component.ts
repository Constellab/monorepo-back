import {AfterViewInit, Component, Host, OnInit} from '@angular/core';
import {MatSelect} from '@angular/material/select';
import {FlEmbeddedOptionsAbstractDirective} from '../../../../abstract-directive/fl-embedded-options-abstract.directive';
import {FlChartComponentTypeSelectOption, flChartComponentTypeSelectOptions} from '../../model/fl-chart-component.class';

/**
 * Component to place inside a mat-select to add the option of available charts
 */
@Component({
  selector: 'fl-chart-component-select-options',
  templateUrl: './fl-chart-component-select-options.component.html',
  styleUrls: ['./fl-chart-component-select-options.component.scss']
})
export class FlChartComponentSelectOptionsComponent extends FlEmbeddedOptionsAbstractDirective
  implements OnInit, AfterViewInit {

  charts: FlChartComponentTypeSelectOption[] = flChartComponentTypeSelectOptions;

  constructor(@Host() private select: MatSelect) {
    super(select);
  }

  ngOnInit(): void {
  }

  ngAfterViewInit(): void {
    this.initOptions();
  }

}
