import {FlSpreadsheetChartSelectionHelper,} from '../../utils/fl-spreadsheet-chart-selection.helper';
import {
  FlSheetChart2dSerieSelectionForm,
  FlSheetChartSelectionFormAdditional,
  FlSheetSelectionRange
} from './fl-sheet-chart-selection-form.class';
import {FlCellsRange} from '../selection/fl-cells-range.class';
import {FlSheet} from '../fl-sheet.class';


/**
 * Mode for the selection
 * Single, it generates a string based on current single selection (like A1:C3)
 * Multi, it generates a multi selection separated with ',' (like A1:B3,D1:D4)
 */
export type FlSheetSelectionMode = 'single' | 'multi'

// on onlyY mode, there is no input to select X abscisse data
export type FlSpreadsheetSelectSerieMode = 'full' | 'onlyY';

export interface FlSpreadsheetChartSerieSelectionInput {
  mode: FlSpreadsheetSelectSerieMode;
  serie: FlSheetChart2dSerieSelectionForm;
  ySelectionMode: FlSheetSelectionMode;
  xSelectionMode?: FlSheetSelectionMode;
}

/**
 * Object to config chart selection form based on chart type
 */
export abstract class FlSheetChartFormConfig {

  constructor(private sheet: FlSheet) {
  }


  abstract createSeriesFromDataRange(selectionRange: FlSheetSelectionRange): FlSheetChart2dSerieSelectionForm[];

  abstract getSelectSerieConfig(serie: FlSheetChart2dSerieSelectionForm): FlSpreadsheetChartSerieSelectionInput;

  getNbMaxOfSeries(): number {
    return Infinity;
  }

  getAdditionalFieldsName(): (keyof FlSheetChartSelectionFormAdditional)[] {
    return [];
  }

  /**
   * Create multiple series from a selection range. It only creates y selection
   * @param selectionRange
   * @param serieIndex specific case to start serie index with an offset
   * @protected
   */
  protected createMultipleSeriesForY(selectionRange: FlSheetSelectionRange, serieIndex: number = 0): FlSheetChart2dSerieSelectionForm[] {
    if (selectionRange.type === 'range') {
      const series: FlSheetChart2dSerieSelectionForm[] = [];

      let i = serieIndex;
      for (const selection of selectionRange.selection) {
        // split each ranch by column
        const columnRanges = FlCellsRange.MultipleFromCoords(selection).splitToColumnRanges();

        for (const columnRange of columnRanges) {
          series.push({
            name: this.getColumnSerieName(columnRange.from.column, i),
            y: {type: 'range', selection: [columnRange.toCoords()]}
          });
          i++;
        }
      }
      return series;
    } else {
      return selectionRange.selection.map((selection) =>
        ({
          name: selection,
          y: {type: 'columns', selection: [selection]}
        }));
    }
  }

  /**
   * Create multiple series from a selection range. If there is series, it takes the first one as x for other series
   * @param selectionRange
   * @protected
   */
  protected createMultipleSeriesForXAndY(selectionRange: FlSheetSelectionRange): FlSheetChart2dSerieSelectionForm[] {
    // split y selection by column
    const series = this.createMultipleSeriesForY(selectionRange);

    if (series.length > 1) {
      // re-retrieve the serie with correct index (because first serie is x
      const ySeries = this.createMultipleSeriesForY(selectionRange, -1);
      // Extract the first selection as x selection
      // noinspection JSSuspiciousNameCombination
      const x: FlSheetSelectionRange = ySeries.shift().y;

      // add the x to each serie and reset name
      ySeries.forEach((serie) => {
        serie.x = x;
      });
      return ySeries;
    } else {
      // if there is only one selection, use it as a serie with Y
      return series;
    }
  }

  protected createSingleSelectionForY(selectionRange: FlSheetSelectionRange): FlSheetChart2dSerieSelectionForm[] {
    return [{
      name: FlSpreadsheetChartSelectionHelper.getDefaultSerieName(0),
      y: selectionRange
    }];
  }

  private getColumnSerieName(columnIndex: number, serieIndex: number): string {
    const columnInfo = this.sheet.getColumnInfo(columnIndex);
    if (columnInfo.name) {
      return columnInfo.name;
    }

    return FlSpreadsheetChartSelectionHelper.getDefaultSerieName(serieIndex);
  }

}


//////////////////////////////////// BAR PLOT & BOX PLOT/////////////////////////////////////
export class FlSheetBasic2dPlotFormConfig extends FlSheetChartFormConfig {
  createSeriesFromDataRange(selectionRange: FlSheetSelectionRange): FlSheetChart2dSerieSelectionForm[] {
    return this.createMultipleSeriesForY(selectionRange);
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
  createSeriesFromDataRange(selectionRange: FlSheetSelectionRange): FlSheetChart2dSerieSelectionForm[] {
    return this.createMultipleSeriesForXAndY(selectionRange);
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
  createSeriesFromDataRange(selectionRange: FlSheetSelectionRange): FlSheetChart2dSerieSelectionForm[] {
    return this.createMultipleSeriesForY(selectionRange);
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
  createSeriesFromDataRange(selectionRange: FlSheetSelectionRange): FlSheetChart2dSerieSelectionForm[] {
    return this.createMultipleSeriesForY(selectionRange);
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
  createSeriesFromDataRange(selectionRange: FlSheetSelectionRange): FlSheetChart2dSerieSelectionForm[] {
    return this.createSingleSelectionForY(selectionRange);
  }

  getNbMaxOfSeries(): number {
    return 1;
  }

  getSelectSerieConfig(serie: FlSheetChart2dSerieSelectionForm): FlSpreadsheetChartSerieSelectionInput {
    return {
      serie: serie,
      mode: 'onlyY',
      ySelectionMode: 'single',
    };
  }
}


//////////////////////////////////// HISTOGRAM /////////////////////////////////////
export class FlSheetHistogramFormConfig extends FlSheetChartFormConfig {
  createSeriesFromDataRange(selectionRange: FlSheetSelectionRange): FlSheetChart2dSerieSelectionForm[] {
    return this.createSingleSelectionForY(selectionRange);
  }

  getAdditionalFieldsName(): (keyof FlSheetChartSelectionFormAdditional)[] {
    return ['nbOfBins'];
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
