import {Component, Input, OnInit} from '@angular/core';
import {FlChartLabelFormatter} from '../../../model/fl-chart-label-formatter.class';

/**
 * Simple component to show a value of a chart using a formatter. It shows the long value in a tooltip.
 */
@Component({
  selector: 'fl-chart-value',
  templateUrl: './fl-chart-value.component.html',
  styleUrls: ['./fl-chart-value.component.scss']
})
export class FlChartValueComponent implements OnInit {

  @Input() name: string;

  @Input() value: number;

  @Input() formatter: FlChartLabelFormatter;

  constructor() {
  }

  ngOnInit(): void {
  }

}
