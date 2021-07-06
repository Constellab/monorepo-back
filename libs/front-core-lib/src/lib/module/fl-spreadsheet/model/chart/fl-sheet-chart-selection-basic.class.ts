import {FlSheetChartSelection} from './fl-sheet-chart-selection.class';
import {FlChartType} from '../../../fl-chart/model/fl-chart.class';
import {FlChart2dMultiSerie, FlChartMultiSerie} from '../../../fl-chart/model/data/fl-chart-multi-serie.class';
import {FlSheetChart2dSerieSelectionForm} from './fl-sheet-chart-selection-form.class';
import {FlSheet} from '../fl-sheet.class';
import {FlChartSerie} from '../../../fl-chart/model/data/fl-chart-serie.class';
import {FlSheetSelection} from '../selection/fl-sheet-selection.class';
import {ClHelpService} from '@monorepo/core-lib';

export class FlSheetChartSelectionBasic extends FlSheetChartSelection {

  public chartType: FlChartType.LINE | FlChartType.SCATTER_PLOT;

  constructor(sheet: FlSheet, chartType: FlChartType, dataRange: string,
              seriesNameRange: string, protected series: FlSheetChart2dSerieSelectionForm[]) {
    super(sheet, chartType, dataRange, seriesNameRange);
  }

  exportToSeries(): FlChartMultiSerie<any> {
    const series: FlChart2dMultiSerie<any> = new FlChart2dMultiSerie();
    for (const serie of this.series) {
      const ySelection: FlSheetSelection = this.getMultiSelectionFromString(serie.y);

      if (!ClHelpService.isNullOrEmpty(serie.x)) {
        const xSelection: FlSheetSelection = this.getMultiSelectionFromString(serie.x);
        series.addSerie(new FlChartSerie<any>(this.convertSelectionTo2dDatumWithXData(xSelection, ySelection), serie.name));
      } else {
        series.addSerie(new FlChartSerie<any>(this.convertSelectionTo2dDatum(ySelection), serie.name));
      }
    }

    // series.axisXLabelFormat = this.getXAxisFormat();
    return series;
  }


}
