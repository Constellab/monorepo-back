import {FlSheetChartSelection} from './fl-sheet-chart-selection.class';
import {FlSheetChartSerieSelectionForm} from './fl-sheet-chart-selection-form.class';
import {FlChartConfig} from '../../../fl-chart/model/fl-chart-config.class';
import {FlSheet} from '../fl-sheet.class';
import {FlChartHeatMap, FlChartHeatMapDataContainer} from '../../../fl-chart/model/chart/fl-chart-heat-map.class';
import {ClNumberHelper} from '@monorepo/core-lib';
import {FlChart3dDatum} from '../../../fl-chart/model/data/fl-chart-data.class';
import {FlSheetMultiSelection} from '../selection/fl-sheet-multi-selection.class';

export class FlSheetChartSelectionHeatMap extends FlSheetChartSelection {


  constructor(sheet: FlSheet, private serie: FlSheetChartSerieSelectionForm) {
    super(sheet);
  }

  exportToChart(): FlChartConfig {

    const ySelection: FlSheetMultiSelection = this.getMultiSelectionFromSelectionRange(this.serie.y);

    const selections = ySelection.splitToColumnSelections();

    const chartData: FlChart3dDatum[][] = [];
    for(let i = 0; i < selections.length; i++){
      chartData.push(selections[i].getCellsValuesFlat().map(
        (value, index) => new FlChart3dDatum(i, index, ClNumberHelper.fromString(value, 0))
      ));
    }

    const dataContainer: FlChartHeatMapDataContainer = new FlChartHeatMapDataContainer(chartData);
    return new FlChartHeatMap(dataContainer);
  }

}
