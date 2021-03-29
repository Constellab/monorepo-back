import {Component, Input, OnInit} from '@angular/core';
import {FlChart2dDatumSerie, FlChart2dMultipleSerie} from '../../../../model/fl-chart-2d-data.class';
import {FlChartScaleColor} from '../../../../model/fl-chart-scale-color.class';

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

  @Input() dataContainer: FlChart2dMultipleSerie<FlChart2dDatumSerie>;

  @Input() colorScale: FlChartScaleColor;

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
        text: serie.serieKey.toString(),
        color: this.colorScale.scale(serie.serieKey)
      });
    }

    this.legends = legends;
  }

}
