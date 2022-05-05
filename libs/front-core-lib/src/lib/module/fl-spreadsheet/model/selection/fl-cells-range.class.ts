import {FlSpreadsheetHelper} from '../../utils/fl-spreadsheet.helper';
import {FlCellCoord, FlCellCoordRange} from '../fl-cell-coord.class';

export type FlCellsRangeType = 'single' | 'multiple' | 'columns' | 'rows';

/**
 * Object to handle a single range of cells
 */
export class FlCellsRange {
  constructor(
    public readonly type: FlCellsRangeType,
    public readonly startRow: number,
    public readonly startColumn: number,
    public readonly endRow: number,
    public readonly endColumn: number) {
  }

  /**
   * create selection from string formatted like A2:B5
   */
  public static MultipleFromString(coordRange: string): FlCellsRange {
    const coords = FlSpreadsheetHelper.coordRangeFromString(coordRange);
    return FlCellsRange.MultipleFromCellCoordsRange(coords);
  }

  public static MultipleFromCellCoordsRange(coords: FlCellCoordRange): FlCellsRange {
    return new FlCellsRange('multiple', coords.from.row, coords.from.column,
      coords.to.row, coords.to.column);
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

  public toCoords(): FlCellCoordRange {
    return {
      from: this.from,
      to: this.to
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

  public equals(range: FlCellsRange): boolean {
    return range.from.row === this.from.row && range.from.column === this.from.column
      && range.to.row === range.to.row && range.to.column === range.to.column;
  }

  public splitToColumnRanges(): FlCellsRange[] {
    const ranges: FlCellsRange[] = [];
    for (let i = this.from.column; i <= this.to.column; i++) {
      ranges.push(new FlCellsRange('multiple', this.from.row, i, this.to.row, i));
    }
    return ranges;
  }

  public countCells(): number {
    return (this.to.column - this.from.column + 1) * (this.to.row - this.from.row + 1);
  }
}
