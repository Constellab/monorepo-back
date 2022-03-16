import {FlChartType} from '../../../fl-chart/model/fl-chart.class';
import {FlSheetSingleSelection} from '../selection/fl-sheet-single-selection.class';


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
 * Type used in the form of {@link FlSpreadsheetChartSelectionComponent}
 */
export interface FlSheetChartSelectionForm {
  id: symbol;

  // type of the chart
  chartType: FlChartType;

  // global data range form a multiple selection
  dataRange?: string;

  // list of series
  series: FlSheetChart2dSerieSelectionForm[];

  additionalFields: FlSheetChartSelectionFormAdditional;
}

export interface FlSheetChartSelectionFormAdditional {
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


interface Chart {
  series: ChartSerie[];
}

interface ChartSerie {
  name?: string;
  ySelection: ChartSelection;
  xSelection: ChartSelection;
}

type ChartSelection = ChartSelectionRange | ChartSelectionColumn;

interface ChartSelectionRange {
  type: 'range';
  // selection: string; // string of the selection link A1:A2;B1:B2
  selection: {
    fromRowId: number;
    toRowId: number;
    fromColumnId: number;
    toColumnId: number;
  }[]
}

interface ChartSelectionColumn {
  type: 'column';
  columns: string[]; // string of the selection link column1,column2
}

// todo gérer par tag ?
// Quel mode par defaut ?
