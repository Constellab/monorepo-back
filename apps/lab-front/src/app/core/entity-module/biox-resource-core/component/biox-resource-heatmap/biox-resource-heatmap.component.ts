import {Component, OnInit} from '@angular/core';
import {BioxResourceViewDirective} from '../../model/biox-resource-view-component.class';
import {BioxResourceViewHeatMap} from '../../../../model/entities/resource/biox-resource-view.entity';
import {FlChart2dMultiSerie, FlChart3dDatum, FlChartSerie, FlChartType} from '@monorepo/front-core-lib';
import {ClNumberHelper} from '@monorepo/core-lib';

@Component({
  selector: 'gen-biox-resource-heatmap',
  templateUrl: './biox-resource-heatmap.component.html',
  styleUrls: ['./biox-resource-heatmap.component.scss']
})
export class BioxResourceHeatmapComponent extends BioxResourceViewDirective<BioxResourceViewHeatMap> implements OnInit {

  series: FlChart2dMultiSerie<FlChart3dDatum>;
  chartType: FlChartType = FlChartType.HEAT_MAP;

  ngOnInit(): void {
    this.convertToChartData();
  }

  private convertToChartData(): void {
    const series: FlChart2dMultiSerie<FlChart3dDatum> = new FlChart2dMultiSerie();

    let columnIndex: number = 0;
    for (const columnName in this.view.data) {
      // convert all the column data into a 3d datum, where x = columnIndex, y = index of value and z = value as number
      const data: FlChart3dDatum[] = this.view.data[columnName].map(
        (value, index) => new FlChart3dDatum(columnIndex, index, ClNumberHelper.fromString(value, 0))
      );
      series.addSerie(new FlChartSerie(data, columnName));
      columnIndex++;
    }

    this.series = series;
  }


}
