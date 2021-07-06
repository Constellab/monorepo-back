import {FlChartType} from '../../../fl-chart/model/fl-chart.class';

/**
 * Type used in the form of {@link FlSpreadsheetChartSelectionComponent}
 */
export interface FlSheetChartSelectionForm {
  // type of the chart
  chartType: FlChartType;

  // global data range form a multiple selection
  dataRange?: string;

  // global range selection for the series names
  seriesNameRange?: string;

  // list of series
  series: FlSheetChart2dSerieSelectionForm[];

  // for the Histogram
  nbOfBins?: number;
}


/**
 * Form value of a serie selection
 */
export interface FlSheetChartSerieSelectionForm {
  name?: string;
  y: string; // string of the selection
}

/**
 * Form value of a serie selection where X is selectable
 */
export interface FlSheetChart2dSerieSelectionForm extends FlSheetChartSerieSelectionForm {
  x?: string; // string of the x selection
}

