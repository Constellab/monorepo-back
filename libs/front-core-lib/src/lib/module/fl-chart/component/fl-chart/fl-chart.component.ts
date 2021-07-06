import {Component, ElementRef, Input, OnInit, ViewChild} from '@angular/core';
import {FlChartType} from '../../model/fl-chart.class';
import {FlThemeService} from '../../../../service/fl-theme.service';
import {FlChartState} from '../../state/fl-chart.state';

/**
 * Component to show a chart, must be included in the FlChartContainer
 *
 * The FlChartState must be provider by the parent
 */
@Component({
  selector: 'fl-chart',
  templateUrl: './fl-chart.component.html',
  styleUrls: ['./fl-chart.component.scss']
})
export class FlChartComponent implements OnInit {

  @ViewChild('chart', {static: true}) chartHtmlContainer: ElementRef<HTMLElement>;

  @Input() chartType: FlChartType;

  constructor(private themeService: FlThemeService,
              private state: FlChartState) {
  }

  ngOnInit(): void {
    this.state.initChart(460, 400, this.chartHtmlContainer.nativeElement, this.chartType);
  }
}
