import {FlCellCoord, FlSheetSingleSelectionType} from './fl-sheet-single-selection.class';
import {FlSpreadsheetHelper} from '../../utils/fl-spreadsheet.helper';

export class FlSheetRange {


  protected constructor(
    public type: FlSheetSingleSelectionType,
    public startRow: number,
    public startColumn: number,
    public endRow: number,
    public endColumn: number) {
  }


  /**
   * Object representing a selection range
   * The 'from' coord are lower or equals than the 'to' coord
   */
  public get from(): FlCellCoord {
    return {
      row: Math.min(this.startRow, this.endRow),
      column: Math.min(this.startColumn, this.endColumn)
    };
  }

  public get to(): FlCellCoord {
    return {
      row: Math.max(this.startRow, this.endRow),
      column: Math.max(this.startColumn, this.endColumn)
    };
  }

  public getFirstSelectedCellCoord(): FlCellCoord {
    return {
      row: this.startRow,
      column: this.startColumn
    };
  }

  // return true if the coord are within the selection
  public coordIsSelected(coord: FlCellCoord): boolean {
    const from: FlCellCoord = this.from;
    const to: FlCellCoord = this.to;
    return coord.row >= from.row && coord.column >= from.column &&
      coord.row <= to.row && coord.column <= to.column;
  }

  // return true if the row is within selection
  public rowIsSelected(row: number): boolean {
    return row >= this.from.row && row <= this.to.row;
  }

  // return true if the column is within selection
  public columnIsSelected(column: number): boolean {
    return column >= this.from.column && column <= this.to.column;
  }

  // return selection as text like B2:G5
  public toString(): string {
    return FlSpreadsheetHelper.coordToString(this.from) + FlSpreadsheetHelper.coordSplitter +
      FlSpreadsheetHelper.coordToString(this.to);
  }

  public equals(range: FlSheetRange): boolean {
    return range.from.row === this.from.row && range.from.column === this.from.column
      && range.to.row === range.to.row && range.to.column === range.to.column;
  }
}
