import {Injectable} from '@angular/core';
import {FlSpreadsheetSelectionState} from './fl-spreadsheet-selection.state';
import {FlSpreadsheetState} from './fl-spreadsheet.state';
import {FlClipboardService} from '../../../service/fl-clipboard.service';
import {FlSpreadsheetActions} from './fl-spreadsheet-actions.state';
import {FlCellCoord} from '../model/fl-cell-coord.class';

/**
 * Unique state shared across the spreadsheet to handle clipboard
 */
@Injectable()
export class FlSpreadsheetClipboardState {

  // \n character
  private readonly rowSeparator: string = String.fromCharCode(10);
  // tab character
  private readonly columnSeparator: string = String.fromCharCode(9);

  constructor(private state: FlSpreadsheetState,
              private selectionState: FlSpreadsheetSelectionState,
              private clipboard: FlClipboardService,
              private actionState: FlSpreadsheetActions) {
  }

  /**
   * Copy the current selected cells value to the clipboard
   */
  public copyCurrentSelectionToClipboard(): void {
    const selection = this.selectionState.currentSelection;

    if (selection) {
      const cellsValues: string[][] = selection.getCellsValues().map(rows =>
        rows.map(value => value?.toString() ?? null));

      this.clipboard.copy(this.convertCellsValuesToText(cellsValues));
    }
  }

  /**
   * Paste the clipboard value to the selection
   */
  public pasteClipboardValueToSelection(): void {
    this.clipboard.readText().then(
      clipText => this.pasteValue(clipText)
    );
  }

  // todo gérer quand le text copié a + de colones ou lignes que le tableau
  private pasteValue(clipText: string): void {
    const selection = this.selectionState.currentSelection;
    if (clipText == null || clipText.length === 0 || selection == null) {
      return;
    }

    // get values from pasted text
    const cellsValues: string[][] = this.convertTextToCellsValues(clipText);

    const from: FlCellCoord = selection.from;

    const maxValuesRowLength: number = cellsValues.reduce((m, x) => m.length > x.length ? m : x, []).length;
    const to: FlCellCoord = {
      row: from.row + cellsValues.length - 1,
      column: from.column + maxValuesRowLength - 1
    };

    // select the same size as pasted cells
    const newSelection = this.selectionState.selectMultipleCell(selection.from, to);

    this.actionState.updateCellsValues(cellsValues, newSelection);
  }

  private convertCellsValuesToText(cells: string[][]): string {
    let result: string = '';
    for (const row of cells) {
      if (result !== '') {
        result += this.rowSeparator;
      }
      result += row.join(this.columnSeparator);
    }

    return result;
  }

  private convertTextToCellsValues(value: string): string[][] {
    const result: string[][] = [];
    const rows: string[] = value.split(this.rowSeparator);

    for (const row of rows) {
      if (row?.length > 0) {
        result.push(row.split(this.columnSeparator));
      }
    }

    return result;
  }
}
