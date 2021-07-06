import {Component, OnInit} from '@angular/core';
import {FlChartState} from '../../state/fl-chart.state';

interface Legend {

  text: string;

  color: string;
}

/**
 * Display the legend of a chart
 */
@Component({
  selector: 'fl-chart-legend',
  templateUrl: './fl-chart-legend.component.html',
  styleUrls: ['./fl-chart-legend.component.scss']
})
export class FlChartLegendComponent implements OnInit {

  legends: Legend[];

  constructor(private state: FlChartState) {
  }

  ngOnInit(): void {
    this.initLegend();
  }

  private initLegend(): void {
    const legends: Legend[] = [];

    for (const serie of this.state.dataContainer.series) {
      legends.push({
        text: serie.name,
        color: this.state.getSerieColor(serie.key)
      });
    }

    this.legends = legends;
  }

}
