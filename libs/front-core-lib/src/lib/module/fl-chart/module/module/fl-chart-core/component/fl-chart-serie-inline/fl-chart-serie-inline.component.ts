import {Component, Input, OnInit} from '@angular/core';

@Component({
  selector: 'fl-chart-serie-inline',
  templateUrl: './fl-chart-serie-inline.component.html',
  styleUrls: ['./fl-chart-serie-inline.component.scss']
})
export class FlChartSerieInlineComponent implements OnInit {

  @Input() serieName: string;

  @Input() color: string;

  constructor() {
  }

  ngOnInit(): void {
  }

}
