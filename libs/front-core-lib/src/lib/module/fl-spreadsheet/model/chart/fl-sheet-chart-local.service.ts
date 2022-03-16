import {FlSheetChartService} from './fl-sheet-chart.service';
import {FlSheet} from '../fl-sheet.class';
import {FlSheetChart2dSerieSelectionForm, FlSheetChartSerieSelectionForm} from './fl-sheet-chart-selection-form.class';
import {FlChartConfig, FlChartType} from '../../../fl-chart/public-api';
import {FlSheetChartSelectionBarPlot, FlSheetChartSelectionHistogram} from './fl-sheet-chart-selection-bar-plot.class';
import {FlSheetChartSelectionBoxPlot} from './fl-sheet-chart-selection-box-plot.class';
import {FlSheetChartSelectionHeatMap} from './fl-sheet-chart-selection-heat-map.class';
import {FlSheetChartSelectionBasic} from './fl-sheet-chart-selection-basic.class';

/**
 * Service to generate chart from the form selection and a sheet. It does not call an external service
 * it is generated locally
 */
export class FlSheetChartLocalService extends FlSheetChartService {

  constructor(private sheet: FlSheet) {
    super();
  }

  generateBar(series: FlSheetChartSerieSelectionForm[]): FlChartConfig {
    return new FlSheetChartSelectionBarPlot(this.sheet, FlChartType.BAR_PLOT, series).exportToChart();
  }

  generateBoxPlot(series: FlSheetChartSerieSelectionForm[]): FlChartConfig {
    return new FlSheetChartSelectionBoxPlot(this.sheet, series).exportToChart();
  }

  generateHeatMap(serie: FlSheetChartSerieSelectionForm): FlChartConfig {
    return new FlSheetChartSelectionHeatMap(this.sheet, serie).exportToChart();
  }

  generateHistogram(serie: FlSheetChartSerieSelectionForm, nbOfBins?: number): FlChartConfig {
    return new FlSheetChartSelectionHistogram(this.sheet, serie, nbOfBins).exportToChart();
  }

  generateLine2d(series: FlSheetChart2dSerieSelectionForm[]): FlChartConfig {
    return new FlSheetChartSelectionBasic(this.sheet, FlChartType.LINE, series).exportToChart();
  }

  generateScatterPlot2d(series: FlSheetChart2dSerieSelectionForm[]): FlChartConfig {
    return new FlSheetChartSelectionBasic(this.sheet, FlChartType.SCATTER_PLOT, series).exportToChart();
  }

  generateStackBar(series: FlSheetChartSerieSelectionForm[]): FlChartConfig {
    return new FlSheetChartSelectionBarPlot(this.sheet, FlChartType.STACKED_PLOT, series).exportToChart();
  }

  generateVennDiagram(series: FlSheetChartSerieSelectionForm[]): FlChartConfig {
    throw Error('Venn diagram not supported in local');
  }


}
