import {FlChartType} from '../../../fl-chart/model/fl-chart.class';
import {FlSheetSingleSelection} from '../selection/fl-sheet-single-selection.class';
import {FlCellCoordRange} from '../fl-cell-coord.class';


export type FlSpreadsheetChartSelectionInput =
  FlSpreadsheetChartSelectionInputCreate
  | FlSpreadsheetChartSelectionInputUpdate;

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
 * Type used in the form of {@link FlSheetChartSelectionComponent}
 */
export interface FlSheetChartSelectionForm {
  id: symbol;

  // type of the chart
  chartType: FlChartType;

  // global data range form a multiple selection
  dataRange?: FlSheetSelectionRange;

  // list of series
  series: FlSheetChart2dSerieSelectionForm[];

  additionalFields: FlSheetChartSelectionFormAdditional;
}

export type FlSheetSelectionRangeType = 'range' | 'columns';

export type FlSheetSelectionRange = {
  type: 'range';
  selection: FlCellCoordRange[];
} | {
  type: 'columns';
  // selected columns
  selection: string[];
}


export interface FlSheetChartSelectionFormAdditional {
  // for the Histogram
  nbOfBins?: number;
  density?: boolean;
  // for the stack bar
  normalize?: boolean;
}


/**
 * Form value of a serie selection
 */
export interface FlSheetChartSerieSelectionForm {
  name?: string;
  y: FlSheetSelectionRange; // string of the selection
}

/**
 * Form value of a serie selection where X is selectable
 */
export interface FlSheetChart2dSerieSelectionForm extends FlSheetChartSerieSelectionForm {
  x?: FlSheetSelectionRange; // string of the x selection
}


