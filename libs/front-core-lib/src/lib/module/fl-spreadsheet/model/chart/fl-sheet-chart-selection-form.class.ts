import {FlChartType} from '../../../fl-chart/model/fl-chart.class';
import {FlSheetSingleSelection} from '../selection/fl-sheet-single-selection.class';


export type FlSpreadsheetChartSelectionInput = FlSpreadsheetChartSelectionInputCreate | FlSpreadsheetChartSelectionInputUpdate;

// data for when selecting data for a new chart
export interface FlSpreadsheetChartSelectionInputCreate {
  mode: 'create';
  currentSelection: FlSheetSingleSelection;
}

// data for when re-selecting data for an existing chart chart
// it contain the complete selection object
export interface FlSpreadsheetChartSelectionInputUpdate {
  mode: 'update';
  selection: FlSheetChartSelectionForm;
}

export interface FlSheetChartSelectionResult {
  mode: 'create' | 'update';
  selection: FlSheetChartSelectionForm;
}


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

