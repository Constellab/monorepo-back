import {FlSheetChartSelection} from './fl-sheet-chart-selection.class';
import {FlChartType} from '../../../fl-chart/model/fl-chart.class';
import {FlChartConfig} from '../../../fl-chart/model/fl-chart-config.class';
import {FlSheet} from '../fl-sheet.class';
import {FlSheetChart2dSerieSelectionForm} from './fl-sheet-chart-selection-form.class';
import {FlChart2dMultiSerie} from '../../../fl-chart/model/data/fl-chart-multi-serie.class';
import {FlChartLine2d, FlChartScatterPlot2d} from '../../../fl-chart/model/chart/fl-chart-linear-2d.class';

export class FlSheetChartSelectionBasic extends FlSheetChartSelection {


  constructor(sheet: FlSheet, private chartType: FlChartType.LINE | FlChartType.SCATTER_PLOT,
              private series: FlSheetChart2dSerieSelectionForm[],
              private xAxisLabel?: string, private yAxisLabel?: string) {
    super(sheet);
  }

  exportToChart(): FlChartConfig {
    const series: FlChart2dMultiSerie<any> = new FlChart2dMultiSerie();
    for (const serie of this.series) {
      series.addSerie(this.convert2DFormSelectionToChartSerie(serie));
    }

    series.axisXLabel = this.xAxisLabel;
    series.axisYLabel = this.yAxisLabel;

    if (this.chartType === FlChartType.LINE) {
      return new FlChartLine2d(series);
    } else {
      return new FlChartScatterPlot2d(series);
    }
  }


}
