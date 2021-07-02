import {FlSheetChartSelection} from './fl-sheet-chart-selection.class';
import {FlChartComponentType} from '../../../fl-chart/model/fl-chart-component.class';
import {FlSheet} from '../fl-sheet.class';
import {FlSheetChartSerieSelectionForm} from './fl-sheet-chart-selection-form.class';
import {FlChartMultiSerie} from '../../../fl-chart/model/data/fl-chart-multi-serie.class';
import {FlChartBoxPlotSerie, flChartGetBoxPlotData} from '../../../fl-chart/model/data/fl-chart-box-plot-data.class';
import {FlSheetSelection} from '../selection/fl-sheet-selection.class';

export class FlSheetChartSelectionBoxPlot extends FlSheetChartSelection {

  public chartType: FlChartComponentType.BOX_PLOT;

  constructor(sheet: FlSheet, chartType: FlChartComponentType, dataRange: string,
              seriesNameRange: string, protected series: FlSheetChartSerieSelectionForm[]) {
    super(sheet, chartType, dataRange, seriesNameRange);
  }

  exportToSeries(): FlChartMultiSerie<any> {
    const series: FlChartMultiSerie<any> = new FlChartMultiSerie();

    for (const serie of this.series) {
      const ySelection: FlSheetSelection = this.getMultiSelectionFromString(serie.y);
      const values: number[] = this.getSelectionValues(ySelection);

      series.addSerie(new FlChartBoxPlotSerie(flChartGetBoxPlotData(values), serie.name));
    }
    return series;
  }


}
