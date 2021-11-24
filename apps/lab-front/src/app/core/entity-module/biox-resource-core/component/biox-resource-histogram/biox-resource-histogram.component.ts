import {Component, Input, OnInit} from '@angular/core';
import {BioxResourceViewDirective} from '../../model/biox-resource-view-component.class';
import {BioxResourceViewHistogram} from '../../../../model/entities/resource/biox-resource-view.entity';
import {FlChart2dMultiSerie, FlChartDataBin, FlChartSerie, FlChartType} from '@monorepo/front-core-lib';

@Component({
  selector: 'gen-biox-resource-histogram',
  templateUrl: './biox-resource-histogram.component.html',
  styleUrls: ['./biox-resource-histogram.component.scss']
})
export class BioxResourceHistogramComponent extends BioxResourceViewDirective<BioxResourceViewHistogram>
  implements OnInit {

  @Input() view: BioxResourceViewHistogram;

  series: FlChart2dMultiSerie<FlChartDataBin>;
  chartType: FlChartType = FlChartType.HISTOGRAM;

  ngOnInit(): void {
    this.convertToChartData();
  }

  private convertToChartData(): void {
    const series: FlChart2dMultiSerie<FlChartDataBin> = new FlChart2dMultiSerie();

    for (const viewSerie of this.view.data.series) {
      const data: FlChartDataBin[] = [];

      for (let i = 0; i < viewSerie.data.x.length - 1; i++) {
        // create the bin
        const min = viewSerie.data.x[i];
        const max = viewSerie.data.x[i + 1];
        data.push(new FlChartDataBin(i, viewSerie.data.y[i], min, max));
      }

      series.addSerie(new FlChartSerie(data, viewSerie.column_name));
    }


    // set the axisXLabelFormat but taking the interval text of the first serie
    series.axisXLabelFormat = (_: number, index: number) => {
      const dataHisto: FlChartDataBin = series.series[0].data[index];
      return dataHisto.getIntervalText();
    };

    this.series = series;
  }

}
