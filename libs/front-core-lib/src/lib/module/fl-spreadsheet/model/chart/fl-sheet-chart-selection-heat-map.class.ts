import {FlSheetChartSelection} from './fl-sheet-chart-selection.class';
import {FlChartType} from '../../../fl-chart/model/fl-chart.class';
import {FlSheetChartSerieSelectionForm} from './fl-sheet-chart-selection-form.class';
import {ClHelpService, ClNumberHelper} from '@monorepo/core-lib';
import {FlChart3dDatum} from '../../../fl-chart/model/data/fl-chart-data.class';
import {FlChartConfig} from '../../../fl-chart/model/fl-chart-config.class';
import {FlSheetSingleSelection} from '../selection/fl-sheet-single-selection.class';
import {FlChartHeatMap, FlChartHeatMapDataContainer} from '../../../fl-chart/model/chart/fl-chart-heat-map.class';

export class FlSheetChartSelectionHeatMap extends FlSheetChartSelection {

  public chartType: FlChartType.HEAT_MAP;

  exportToChart(): FlChartConfig {

    const ySelection: FlSheetSingleSelection = this.getSingleSelectionFromString(this.serie.y);

    const values = ClHelpService.transpose2dArray(ySelection.getCellsValues());

    const chartData: FlChart3dDatum[][] = [];
    for (let i = 0; i < values.length; i++) {
      chartData.push(values[i].map(
        (value, index) => new FlChart3dDatum(i, index, ClNumberHelper.fromString(value, 0))
      ));
    }
    const dataContainer: FlChartHeatMapDataContainer = new FlChartHeatMapDataContainer(chartData);
    return new FlChartHeatMap(dataContainer);
  }

  get serie(): FlSheetChartSerieSelectionForm {
    return this.selectionForm.series[0];
  }
}
