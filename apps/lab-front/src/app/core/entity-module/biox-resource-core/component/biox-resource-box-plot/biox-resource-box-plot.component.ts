import {Component, Input, OnInit} from '@angular/core';
import {BioxResourceViewDirective} from '../../model/biox-resource-view-component.class';
import {BioxResourceViewBoxPlot} from '../../../../model/entities/resource/biox-resource-view.entity';
import {FlChartBoxPlotData, FlChartBoxPlotSerie, FlChartMultiSerie, FlChartType} from '@monorepo/front-core-lib';

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
    // todo fix FlChartMultiSerie to work with FlChartBoxPlotSerie
    const series: FlChartMultiSerie<any> = new FlChartMultiSerie();

    for (const viewSerie of this.view.data) {
      const boxPLotData: FlChartBoxPlotData = {
        min: viewSerie.data.min,
        max: viewSerie.data.max,
        q1: viewSerie.data.q1,
        median: viewSerie.data.median,
        q3: viewSerie.data.q3,
        lowerWhisker: viewSerie.data.lower_whisker,
        upperWhisker: viewSerie.data.upper_whisker,
        nbOfData: viewSerie.data.nb_of_data,
      }

      series.addSerie(new FlChartBoxPlotSerie(boxPLotData, viewSerie.column_name));
    }
    this.series = series;
  }

}
