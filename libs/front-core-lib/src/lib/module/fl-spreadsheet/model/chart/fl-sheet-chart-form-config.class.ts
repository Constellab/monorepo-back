import {FlSheetMultiSelection} from '../selection/fl-sheet-multi-selection.class';
import {
  FlSpreadsheetChartSelectionHelper,
  FlSpreadsheetChartSerieSelectionInput,
  FlSpreadsheetSplitSelectionMode
} from '../../utils/fl-spreadsheet-chart-selection.helper';
import {
  FlSheetChart2dSerieSelectionForm,
  FlSheetChartSelectionFormAdditional
} from './fl-sheet-chart-selection-form.class';


export abstract class FlSheetChartFormConfig {


  abstract createSeriesFromDataRange(dataSelection: FlSheetMultiSelection,
                                     splitSelection: FlSpreadsheetSplitSelectionMode): FlSheetChart2dSerieSelectionForm[];

  abstract getSelectSerieConfig(serie: FlSheetChart2dSerieSelectionForm): FlSpreadsheetChartSerieSelectionInput;

  getNbMaxOfSeries(): number {
    return Infinity;
  }

  getAdditionalFieldsName(): (keyof FlSheetChartSelectionFormAdditional)[] {
    return [];
  }
}


//////////////////////////////////// BAR PLOT & BOX PLOT/////////////////////////////////////
export class FlSheetBasic2dPlotFormConfig extends FlSheetChartFormConfig {
  createSeriesFromDataRange(dataSelection: FlSheetMultiSelection,
                            splitSelection: FlSpreadsheetSplitSelectionMode): FlSheetChart2dSerieSelectionForm[] {
    return FlSpreadsheetChartSelectionHelper.createMultiplesSeriesForY(dataSelection, splitSelection);
  }

  getSelectSerieConfig(serie: FlSheetChart2dSerieSelectionForm): FlSpreadsheetChartSerieSelectionInput {
    return {
      serie: serie,
      mode: 'onlyY',
      ySelectionMode: 'multi',
    };
  }
}

//////////////////////////////////// SCATTER PLOT /////////////////////////////////////
export class FlSheetScatterPlotFormConfig extends FlSheetChartFormConfig {
  createSeriesFromDataRange(dataSelection: FlSheetMultiSelection,
                            splitSelection: FlSpreadsheetSplitSelectionMode): FlSheetChart2dSerieSelectionForm[] {
    return FlSpreadsheetChartSelectionHelper.createMultipleSeriesForXAndY(dataSelection, splitSelection);
  }

  getSelectSerieConfig(serie: FlSheetChart2dSerieSelectionForm): FlSpreadsheetChartSerieSelectionInput {
    return {
      serie: serie,
      mode: 'full',
      ySelectionMode: 'multi',
      xSelectionMode: 'multi'
    };
  }
}

//////////////////////////////////// LINE PLOT /////////////////////////////////////
export class FlSheetLinePlotFormConfig extends FlSheetChartFormConfig {
  createSeriesFromDataRange(dataSelection: FlSheetMultiSelection,
                            splitSelection: FlSpreadsheetSplitSelectionMode): FlSheetChart2dSerieSelectionForm[] {
    return FlSpreadsheetChartSelectionHelper.createMultiplesSeriesForY(dataSelection, splitSelection);
  }

  getSelectSerieConfig(serie: FlSheetChart2dSerieSelectionForm): FlSpreadsheetChartSerieSelectionInput {
    return {
      serie: serie,
      mode: 'full',
      ySelectionMode: 'multi',
      xSelectionMode: 'multi'
    };
  }
}

//////////////////////////////////// VENN DIAGRAM /////////////////////////////////////
export class FlSheetVennDiagramFormConfig extends FlSheetChartFormConfig {
  createSeriesFromDataRange(dataSelection: FlSheetMultiSelection,
                            splitSelection: FlSpreadsheetSplitSelectionMode): FlSheetChart2dSerieSelectionForm[] {
    return FlSpreadsheetChartSelectionHelper.createMultiplesSeriesForY(dataSelection, splitSelection);
  }

  getNbMaxOfSeries(): number {
    return 4;
  }

  getSelectSerieConfig(serie: FlSheetChart2dSerieSelectionForm): FlSpreadsheetChartSerieSelectionInput {
    return {
      serie: serie,
      mode: 'onlyY',
      ySelectionMode: 'multi',
    };
  }
}

//////////////////////////////////// HEAT MAP /////////////////////////////////////
export class FlSheetHeatMapFormConfig extends FlSheetChartFormConfig {
  createSeriesFromDataRange(dataSelection: FlSheetMultiSelection): FlSheetChart2dSerieSelectionForm[] {
    return FlSpreadsheetChartSelectionHelper.createSingleSerieForY(dataSelection);
  }

  getNbMaxOfSeries(): number {
    return 1;
  }

  getSelectSerieConfig(serie: FlSheetChart2dSerieSelectionForm): FlSpreadsheetChartSerieSelectionInput {
    return {
      serie: serie,
      mode: 'onlyY',
      ySelectionMode: 'multi',
    };
  }
}


//////////////////////////////////// HISTOGRAM /////////////////////////////////////
export class FlSheetHistogramFormConfig extends FlSheetChartFormConfig {
  createSeriesFromDataRange(dataSelection: FlSheetMultiSelection): FlSheetChart2dSerieSelectionForm[] {
    return FlSpreadsheetChartSelectionHelper.createSingleSerieForY(dataSelection);
  }

  getNbMaxOfSeries(): number {
    return 1;
  }


  getAdditionalFieldsName(): (keyof FlSheetChartSelectionFormAdditional)[] {
    return ['nbOfBins'];
  }

  getSelectSerieConfig(serie: FlSheetChart2dSerieSelectionForm): FlSpreadsheetChartSerieSelectionInput {
    return {
      serie: serie,
      mode: 'onlyY',
      ySelectionMode: 'multi',
    };
  }
}
