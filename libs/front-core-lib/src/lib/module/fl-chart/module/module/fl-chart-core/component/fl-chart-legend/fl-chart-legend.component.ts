import {Component, Input, OnInit} from '@angular/core';
import {FlChart2dDatum} from '../../../../../model/fl-chart-2d-data.class';
import {FlChartScaleColorMulti} from '../../../../../model/fl-chart-scale-color.class';
import {FlChart2dMultiSerie} from '../../../../../model/fl-chart-2d-multi-serie.class';

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

  @Input() dataContainer: FlChart2dMultiSerie<FlChart2dDatum>;

  @Input() colorScale: FlChartScaleColorMulti;

  legends: Legend[];

  constructor() {
  }

  ngOnInit(): void {
    this.initLegend();
  }

  private initLegend(): void {
    const legends: Legend[] = [];

    for (const serie of this.dataContainer.series) {
      legends.push({
        text: serie.name,
        color: this.colorScale.scale(serie.key)
      });
    }

    this.legends = legends;
  }

}
