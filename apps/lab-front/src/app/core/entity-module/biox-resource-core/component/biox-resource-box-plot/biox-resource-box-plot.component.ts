import {Component, Input, OnInit} from '@angular/core';
import {BioxResourceViewDirective} from '../../model/biox-resource-view-component.class';
import {BioxResourceViewBoxPlot} from '../../../../model/entities/resource/biox-resource-view.entity';
import {FlChartBoxPlotSerie, FlChartMultiSerie, FlChartType} from '@monorepo/front-core-lib';

@Component({
  selector: 'gen-biox-resource-box-plot',
  templateUrl: './biox-resource-box-plot.component.html',
  styleUrls: ['./biox-resource-box-plot.component.scss']
})
export class BioxResourceBoxPlotComponent extends BioxResourceViewDirective<BioxResourceViewBoxPlot>
  implements OnInit {


  @Input() view: BioxResourceViewBoxPlot;

  series: FlChartMultiSerie<FlChartBoxPlotSerie>;
  chartType: FlChartType = FlChartType.BOX_PLOT;

  ngOnInit(): void {
    this.convertToChartData();
  }

  private convertToChartData(): void {
    const series: FlChartMultiSerie<any> = new FlChartMultiSerie();

    for (const viewSerie of this.view.data.series) {
      const serie = new FlChartBoxPlotSerie([], viewSerie.column_names.join(' '));

      for (let i = 0; i < viewSerie.data.max.length; i++) {
        serie.addData({
          min: viewSerie.data.min[i],
          max: viewSerie.data.max[i],
          q1: viewSerie.data.q1[i],
          median: viewSerie.data.median[i],
          q3: viewSerie.data.q3[i],
          lowerWhisker: viewSerie.data.lower_whisker[i],
          upperWhisker: viewSerie.data.upper_whisker[i],
        });
      }

      series.addSerie(serie);
    }

    if (this.view.data.x_tick_labels) {
      series.setXTickLabels(this.view.data.x_tick_labels);
    }
    this.series = series;
  }

}
