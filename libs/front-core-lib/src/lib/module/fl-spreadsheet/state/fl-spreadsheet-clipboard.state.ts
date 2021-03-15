import {Injectable} from '@angular/core';
import {FlSpreadsheetSelectionState} from './fl-spreadsheet-selection.state';
import {FlCellCoord} from '../model/fl-sheet-selection.class';
import {FlSpreadsheetState} from './fl-spreadsheet.state';
import {FlCell} from '../model/fl-cell.class';
import {FlClipboardService} from '../../../service/fl-clipboard.service';

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
              private clipboard: FlClipboardService) {
  }

  /**
   * Copy the current selected cells value to the clipboard
   */
  public copyCurrentSelectionToClipboard(): void {
    const selection = this.selectionState.currentSelection;

    if (selection) {
      const cellsValues: string[][] = selection.getSelectedCells().map(rows => rows.map(cell => cell.value.toString()));

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

  private pasteValue(clipText: string): void {
    const selection = this.selectionState.currentSelection;
    if (clipText == null || clipText.length === 0 || selection == null) {
      return;
    }

    const cellsValues: string[][] = this.convertTextToCellsValues(clipText);
    const startCoord: FlCellCoord = selection.getFirstSelectedCellCoord();

    for (let i = startCoord.row; i < (startCoord.row + cellsValues.length); i++) {
      const copyCellRow: number = i - startCoord.row;
      for (let j = startCoord.column; j < (startCoord.column + cellsValues[copyCellRow].length); j++) {
        const copyCellColumn: number = j - startCoord.column;
        const cell: FlCell = this.state.currentSheet.getCell(i, j);
        if (cell != null) {
          cell.value = cellsValues[copyCellRow][copyCellColumn];
        }
      }
    }
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
