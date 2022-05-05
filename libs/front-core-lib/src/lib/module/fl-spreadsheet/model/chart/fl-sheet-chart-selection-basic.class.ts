import {FlSheetChartSelection} from './fl-sheet-chart-selection.class';
import {FlChartType} from '../../../fl-chart/model/fl-chart.class';
import {FlChartConfig} from '../../../fl-chart/model/fl-chart-config.class';
import {FlSheet} from '../fl-sheet.class';
import {FlSheetChart2dSerieSelectionForm} from './fl-sheet-chart-selection-form.class';
import {FlChart2dMultiSerie} from '../../../fl-chart/model/data/fl-chart-multi-serie.class';
import {FlSheetSelection} from '../selection/fl-sheet-selection.class';
import {ClHelpService} from '@monorepo/core-lib';
import {FlChartSerie} from '../../../fl-chart/model/data/fl-chart-serie.class';
import {FlChartLine2d, FlChartScatterPlot2d} from '../../../fl-chart/model/chart/fl-chart-linear-2d.class';

export class FlSheetChartSelectionBasic extends FlSheetChartSelection {


  constructor(sheet: FlSheet, private chartType: FlChartType.LINE | FlChartType.SCATTER_PLOT,
              private series: FlSheetChart2dSerieSelectionForm[]) {
    super(sheet);
  }

  exportToChart(): FlChartConfig {
    const series: FlChart2dMultiSerie<any> = new FlChart2dMultiSerie();
    for (const serie of this.series) {
      const ySelection: FlSheetSelection = this.getMultiSelectionFromSelectionRange(serie.y);

      if (!ClHelpService.isNullOrEmpty(serie.x)) {
        const xSelection: FlSheetSelection = this.getMultiSelectionFromSelectionRange(serie.x);
        series.addSerie(new FlChartSerie<any>(this.convertSelectionTo2dDatumWithXData(xSelection, ySelection), serie.name));
      } else {
        series.addSerie(new FlChartSerie<any>(this.convertSelectionTo2dDatum(ySelection), serie.name));
      }
    }

    if (this.chartType === FlChartType.LINE) {
      return new FlChartLine2d(series);
    } else {
      return new FlChartScatterPlot2d(series);
    }
  }


}
