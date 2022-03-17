import {FlSheetChartSelection} from './fl-sheet-chart-selection.class';
import {FlChartConfig} from '../../../fl-chart/model/fl-chart-config.class';
import {FlSheetChartSerieSelectionForm} from './fl-sheet-chart-selection-form.class';
import {FlSheet} from '../fl-sheet.class';

export class FlSheetChartSelectionBoxPlot extends FlSheetChartSelection {

  constructor(sheet: FlSheet, private series: FlSheetChartSerieSelectionForm[]) {
    super(sheet);
  }

  exportToChart(): FlChartConfig {
    // const series: FlChartMultiSerie<any> = new FlChartMultiSerie();
    //
    // for (const serie of this.series) {
    //   const ySelection: FlSheetSelection = this.getMultiSelectionFromString(serie.y);
    //   const values: number[] = this.getSelectionValues(ySelection);
    //
    //   series.addSerie(new FlChartBoxPlotSerie([flChartGetBoxPlotData(values)], serie.name));
    // }
    //
    // return new FlChartBoxPlot(series);
    return null;
  }


}
