import {FlSheetChartSelection} from './fl-sheet-chart-selection.class';
import {FlChartType} from '../../../fl-chart/model/fl-chart.class';
import {FlSheet} from '../fl-sheet.class';
import {FlSheetChartSerieSelectionForm} from './fl-sheet-chart-selection-form.class';
import {FlChart2dMultiSerie, FlChartMultiSerie} from '../../../fl-chart/model/data/fl-chart-multi-serie.class';
import {FlSheetSelection} from '../selection/fl-sheet-selection.class';
import {FlChartSerie} from '../../../fl-chart/model/data/fl-chart-serie.class';

export class FlSheetChartSelectionBarPlot extends FlSheetChartSelection {

  public chartType: FlChartType.BAR_PLOT;

  constructor(sheet: FlSheet, chartType: FlChartType, dataRange: string,
              seriesNameRange: string, protected series: FlSheetChartSerieSelectionForm[]) {
    super(sheet, chartType, dataRange, seriesNameRange);
  }

  exportToSeries(): FlChartMultiSerie<any> {
    const series: FlChart2dMultiSerie<any> = new FlChart2dMultiSerie();
    for (const serie of this.series) {
      const ySelection: FlSheetSelection = this.getMultiSelectionFromString(serie.y);

      series.addSerie(new FlChartSerie<any>(this.convertSelectionTo2dDatum(ySelection), serie.name));

    }

    // series.axisXLabelFormat = this.getXAxisFormat();
    return series;
  }


}
