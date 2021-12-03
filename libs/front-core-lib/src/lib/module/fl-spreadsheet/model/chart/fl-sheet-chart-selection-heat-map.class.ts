import {FlSheetChartSelection} from './fl-sheet-chart-selection.class';
import {FlChartType} from '../../../fl-chart/model/fl-chart.class';
import {FlSheetChartSerieSelectionForm} from './fl-sheet-chart-selection-form.class';
import {FlChart2dMultiSerie} from '../../../fl-chart/model/data/fl-chart-multi-serie.class';
import {FlChartSerie} from '../../../fl-chart/model/data/fl-chart-serie.class';
import {ClNumberHelper} from '@monorepo/core-lib';
import {FlChart3dDatum} from '../../../fl-chart/model/data/fl-chart-data.class';
import {FlChartConfig} from '../../../fl-chart/model/fl-chart-config.class';
import {FlChartHeatMap} from '../../../fl-chart/model/chart/fl-chart-heat-map.class';
import {FlSheetSelection} from '../selection/fl-sheet-selection.class';

export class FlSheetChartSelectionHeatMap extends FlSheetChartSelection {

  public chartType: FlChartType.HEAT_MAP;

  exportToChart(): FlChartConfig {
    const series: FlChart2dMultiSerie<FlChart3dDatum> = new FlChart2dMultiSerie();

    let seriesNames: string[];
    if (this.selectionForm.seriesNameRange) {
      const selection = this.getSingleSelectionFromString(this.selectionForm.seriesNameRange);
      seriesNames = selection.getCellsValuesFlat();
    }

    let i = 0;
    for (const serie of this.selectionForm.series) {
      const ySelection: FlSheetSelection = this.getMultiSelectionFromString(serie.y);
      const data: FlChart3dDatum[] = ySelection.getCellsValuesFlat().map(
        (value, index) => new FlChart3dDatum(i, index, ClNumberHelper.fromString(value, 0))
      );

      const serieName = seriesNames && seriesNames[i] ? seriesNames[i] : i.toString();
      series.addSerie(new FlChartSerie(data, serieName));

      i++;
    }

    return new FlChartHeatMap(series);
  }

  get serie(): FlSheetChartSerieSelectionForm {
    return this.selectionForm.series[0];
  }


}
