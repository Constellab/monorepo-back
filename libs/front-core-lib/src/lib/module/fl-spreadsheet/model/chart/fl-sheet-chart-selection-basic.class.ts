import {FlSheetChartSelection} from './fl-sheet-chart-selection.class';
import {FlChartType} from '../../../fl-chart/model/fl-chart.class';
import {FlChart2dMultiSerie} from '../../../fl-chart/model/data/fl-chart-multi-serie.class';
import {FlChartSerie} from '../../../fl-chart/model/data/fl-chart-serie.class';
import {FlSheetSelection} from '../selection/fl-sheet-selection.class';
import {ClHelpService} from '@monorepo/core-lib';
import {FlChartConfig2} from '../../../fl-chart/model/fl-chart-config.class';
import {FlChartLine2d, FlChartScatterPlot2d} from '../../../fl-chart/model/chart/fl-chart-linear-2d.class';

export class FlSheetChartSelectionBasic extends FlSheetChartSelection {

  public chartType: FlChartType.LINE | FlChartType.SCATTER_PLOT;

  exportToChart(): FlChartConfig2 {
    const series: FlChart2dMultiSerie<any> = new FlChart2dMultiSerie();
    for (const serie of this.selectionForm.series) {
      const ySelection: FlSheetSelection = this.getMultiSelectionFromString(serie.y);

      if (!ClHelpService.isNullOrEmpty(serie.x)) {
        const xSelection: FlSheetSelection = this.getMultiSelectionFromString(serie.x);
        series.addSerie(new FlChartSerie<any>(this.convertSelectionTo2dDatumWithXData(xSelection, ySelection), serie.name));
      } else {
        series.addSerie(new FlChartSerie<any>(this.convertSelectionTo2dDatum(ySelection), serie.name));
      }
    }

    if(this.chartType === FlChartType.LINE){
      return new FlChartLine2d(series)
    }
    else{
      return new FlChartScatterPlot2d(series)
    }
  }


}
