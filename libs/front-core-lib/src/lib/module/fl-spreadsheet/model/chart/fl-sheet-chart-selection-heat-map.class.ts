import {FlSheetChartSelection} from './fl-sheet-chart-selection.class';
import {FlSheetChartSerieSelectionForm} from './fl-sheet-chart-selection-form.class';
import {FlChartConfig} from '../../../fl-chart/model/fl-chart-config.class';
import {FlSheet} from '../fl-sheet.class';

export class FlSheetChartSelectionHeatMap extends FlSheetChartSelection {


  constructor(sheet: FlSheet, private serie: FlSheetChartSerieSelectionForm) {
    super(sheet);
  }

  exportToChart(): FlChartConfig {
    //
    // const ySelection: FlSheetSingleSelection = this.getSingleSelectionFromString(this.serie.y);
    //
    // const values = ClHelpService.transpose2dArray(ySelection.getCellsValues());
    //
    // const chartData: FlChart3dDatum[][] = [];
    // for (let i = 0; i < values.length; i++) {
    //   chartData.push(values[i].map(
    //     (value, index) => new FlChart3dDatum(i, index, ClNumberHelper.fromString(value, 0))
    //   ));
    // }
    // const dataContainer: FlChartHeatMapDataContainer = new FlChartHeatMapDataContainer(chartData);
    // return new FlChartHeatMap(dataContainer);
    return null;
  }

}
