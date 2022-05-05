import {FlSheetSingleSelection, FlSheetSingleSelectionFull} from './fl-sheet-single-selection.class';
import {FlCell} from '../fl-cell.class';
import {FlSheet} from '../fl-sheet.class';
import {FlSheetSelection} from './fl-sheet-selection.class';
import {FlCellsMultipleRange} from './fl-cells-multiple-range.class';
import {FlSpreadsheetHelper} from '../../utils/fl-spreadsheet.helper';
import {FlSheetSelectionRange} from '../chart/fl-sheet-chart-selection-form.class';
import {FlCellCoordRange} from '../fl-cell-coord.class';

/**
 * Object to manager multiple selections
 */
export class FlSheetMultiSelection implements FlSheetSelection {

  selections: FlSheetSingleSelection[];

  constructor(selections: FlSheetSingleSelection[] = []) {
    this.selections = selections;
  }

  // generate a multi selection from a string like B2:G5,B5:T4 (separated by ',')
  public static fromString(sheet: FlSheet, selection: string): FlSheetMultiSelection {
    const selections: FlSheetSingleSelection[] = [];

    const strRanges: string[] = selection.split(FlSpreadsheetHelper.selectionsSplitter);
    for (const strRange of strRanges) {
      selections.push(FlSheetSingleSelectionFull.fromString(sheet, strRange));
    }

    return new FlSheetMultiSelection(selections);
  }

  // generate a multi selection from a FlSheetSelectionRange
  public static fromSelectionRange(sheet: FlSheet, selectionRange: FlSheetSelectionRange): FlSheetMultiSelection {
    if (selectionRange.type === 'range') {
      return FlSheetMultiSelection.fromCellCoordsRange(sheet, selectionRange.selection);

    } else {
      return FlSheetMultiSelection.fromColumnNames(sheet, selectionRange.selection);
    }
  }

  // generate a multi selection from a liste of column names
  public static fromColumnNames(sheet: FlSheet, columnNames: string[]): FlSheetMultiSelection {
    const selections: FlSheetSingleSelection[] = [];

    for (const column of columnNames) {
      selections.push(FlSheetSingleSelectionFull.ColumnName(sheet, column));
    }

    return new FlSheetMultiSelection(selections);
  }

  // generate a multi selection from a liste of column names
  public static fromCellCoordsRange(sheet: FlSheet, ranges: FlCellCoordRange[]): FlSheetMultiSelection {
    const selections: FlSheetSingleSelection[] = [];

    for (const range of ranges) {
      selections.push(FlSheetSingleSelectionFull.FromCellCoordsRange(sheet, range));
    }

    return new FlSheetMultiSelection(selections);
  }


  public addSelection(selection: FlSheetSingleSelection): void {
    this.selections.push(selection);
  }

  public addSelections(selections: FlSheetSingleSelection[]): void {
    this.selections.push(...selections);
  }


  public getCellsFlat(): FlCell[] {
    const cells: FlCell[] = [];
    for (const selection of this.selections) {
      cells.push(...selection.getCellsFlat());
    }
    return cells;
  }

  public getCellsValuesFlat(): any[] {
    return this.getCellsFlat().map(cell => cell.value);
  }

  /**
   * Split all the selection into multiple column selection and flatten the result
   */
  public splitToColumnSelections(): FlSheetSingleSelection[] {
    const columnSelection: FlSheetSingleSelection[] = [];
    this.selections.forEach(selection => columnSelection.push(...selection.splitToColumnSelections()));
    return columnSelection;
  }

  /**
   * Split all the selection into multiple column selection and flatten the result
   */
  public splitToRowSelections(): FlSheetSingleSelection[] {
    const columnSelection: FlSheetSingleSelection[] = [];
    this.selections.forEach(selection => columnSelection.push(...selection.splitToRowSelections()));
    return columnSelection;
  }

  // return all selection as text like B2:G5,B5:T4 (separated by ',')
  public toString(): string {
    const ranges = new FlCellsMultipleRange(this.selections.map(selection => selection.getRange()));

    return ranges.toString();
  }
}
