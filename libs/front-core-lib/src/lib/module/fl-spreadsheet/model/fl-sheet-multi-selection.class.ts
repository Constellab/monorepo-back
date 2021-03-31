import {FlSheetSelection, FlSheetSelectionFull} from './fl-sheet-selection.class';
import {FlCell} from './fl-cell.class';
import {FlSheet} from './fl-sheet.class';
import {FlSpreadsheetHelper} from '../utils/fl-spreadsheet.helper';

/**
 * Object to manager multiple selections
 */
export class FlSheetMultiSelection {

  selections: FlSheetSelection[];

  constructor(selections: FlSheetSelection[] = []) {
    this.selections = selections;
  }

  // generate a multi selection from a string like B2:G5,B5:T4 (separated by ',')
  public static fromString(sheet: FlSheet, selection: string): FlSheetMultiSelection {
    const selections: FlSheetSelection[] = [];

    const rows: string[] = selection.split(FlSpreadsheetHelper.selectionsSplitter);
    for (const row of rows) {
      selections.push(FlSheetSelectionFull.FromString(sheet, row));
    }

    return new FlSheetMultiSelection(selections);
  }


  public addSelection(selection: FlSheetSelection): void {
    this.selections.push(selection);
  }

  public addSelections(selections: FlSheetSelection[]): void {
    this.selections.push(...selections);
  }


  public getSelectedCell(): FlCell[] {
    const cells: FlCell[] = [];
    for (const selection of this.selections) {
      cells.push(...selection.getSelectedCellsFlat());
    }
    return cells;
  }

  // return all selection as text like B2:G5,B5:T4 (separated by ',')
  public toString(): string {
    let test: string = '';
    for (const selection of this.selections) {
      if (test !== '') {
        test += FlSpreadsheetHelper.selectionsSplitter;
      }
      test += selection.toString();
    }
    return test;
  }
}
