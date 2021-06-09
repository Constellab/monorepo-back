import {FlSpreadsheetHelper} from '../utils/fl-spreadsheet.helper';
import {FlSheet} from './fl-sheet.class';
import {FlCell} from './fl-cell.class';

export type FlSheetSelectionType = 'single' | 'multiple' | 'columns' | 'rows';


export class FlSheetSelectionRange {

  protected constructor(
    public type: FlSheetSelectionType,
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
    if (this.type === 'columns') {
      return {
        row: 0,
        column: this.startColumn
      };
    } else if (this.type === 'rows') {
      return {
        row: this.startRow,
        column: 0
      };
    } else {
      return {
        row: this.startRow,
        column: this.startColumn
      };
    }
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

  public equals(range: FlSheetSelectionRange): boolean {
    return range.from.row === this.from.row && range.from.column === this.from.column
      && range.to.row === range.to.row && range.to.column === range.to.column;
  }
}

/**
 * Class containing the selection of a spreadsheet with only read method
 * This object is immutable
 */
export class FlSheetSelection extends FlSheetSelectionRange {

  protected constructor(
    public sheet: FlSheet,
    type: FlSheetSelectionType,
    startRow: number,
    startColumn: number,
    endRow: number,
    endColumn: number) {
    super(type, startRow, startColumn, endRow, endColumn);
  }


  public getSelectedCellsFlat(): FlCell[] {
    return this.sheet.getCellsFromRangeFlat(this);
  }

  public getSelectedCells(): FlCell[][] {
    return this.sheet.getCellsFromRange(this);
  }

  public getSelectedCellsValues(): any[][] {
    return this.getSelectedCells().map(rows => rows.map(cell => cell.value));
  }

  public getSelectedCellsValuesFlat(): any[] {
    return this.getSelectedCellsFlat().map(cell => cell.value);
  }

  /**
   * return the first column where the selection started
   * If this is a row or a column selection, we return the first column
   */
  public getFirstSelectedCell(): FlCell {
    const coord: FlCellCoord = this.getFirstSelectedCellCoord();
    return this.sheet.getCell(coord.row, coord.column);
  }


  public exportToRange(): FlSheetSelectionRange {
    return new FlSheetSelectionRange(this.type, this.startRow, this.startColumn, this.endRow, this.endColumn);
  }

  /**
   * return a list of selection, one for each row
   */
  public splitToRowSelections(): FlSheetSelection[] {
    const selections: FlSheetSelection[] = [];
    const from: FlCellCoord = this.from;
    const to: FlCellCoord = this.to;

    for (let i = from.row; i <= to.row; i++) {
      selections.push(FlSheetSelectionFull.Multiple(this.sheet, i, from.column, i, to.column));
    }

    return selections;
  }

  /**
   * return a list of selection, one for each column
   */
  public splitToColumnSelections(): FlSheetSelection[] {
    const selections: FlSheetSelection[] = [];
    const from: FlCellCoord = this.from;
    const to: FlCellCoord = this.to;

    // if there is only one row selection, we return only one row
    if (from.row === to.row) {
      return [FlSheetSelectionFull.Multiple(this.sheet, from.row, from.column, to.row, to.column)];
    }

    for (let i = from.column; i <= to.column; i++) {
      selections.push(FlSheetSelectionFull.Multiple(this.sheet, from.row, i, to.row, i));
    }

    return selections;
  }

  // public getDifference(newSelection: FlSheetSelectionChange): FlSheetSelectionDifference {
  //   // the difference only work if both selection have the same start
  //   if (newSelection.startRow !== this.startRow || newSelection.startColumn !== this.startColumn) {
  //     throw new Error('The selection don\'t have the same start');
  //   }
  //
  //
  //   return {
  //     row: this.rowDirection === 'normal' ? newSelection.endRow - this.endRow :
  //       this.endRow - newSelection.endRow,
  //     column: this.columnDirection === 'normal' ? newSelection.endColumn - this.endColumn :
  //       this.endColumn - newSelection.endColumn,
  //   };
  // }
}

/**
 * Class containing the selection of a spreadsheet with only also update method method
 * This object is immutable
 */
export class FlSheetSelectionFull extends FlSheetSelection {
  constructor(
    public sheet: FlSheet,
    type: FlSheetSelectionType,
    startRow: number,
    startColumn: number,
    endRow: number,
    endColumn: number) {
    super(sheet, type, startRow, startColumn, endRow, endColumn);
  }

  public static Single(sheet: FlSheet, row: number, column: number): FlSheetSelectionFull {
    return new FlSheetSelectionFull(sheet, 'single', row, column, row, column);
  }

  public static Multiple(sheet: FlSheet,
                         startRow: number, startColumn: number,
                         endRow: number, endColumn: number): FlSheetSelectionFull {
    return new FlSheetSelectionFull(sheet, 'multiple', startRow, startColumn, endRow, endColumn);
  }

  public static Columns(sheet: FlSheet, from: number, to: number): FlSheetSelectionFull {
    return new FlSheetSelectionFull(sheet, 'columns', 0, from, sheet.getRowsCount() - 1, to);
  }

  public static Rows(sheet: FlSheet, from: number, to: number): FlSheetSelectionFull {
    return new FlSheetSelectionFull(sheet, 'rows', from, 0, to, sheet.getColumnsCount() - 1);
  }

  public static FromRange(sheet: FlSheet, range: FlSheetSelectionRange): FlSheetSelectionFull {
    return new FlSheetSelectionFull(sheet, range.type, range.startRow, range.startColumn,
      range.endRow, range.endColumn);
  }

  /**
   * create selection from string formatted like A2:B5
   * @param sheet
   * @param selection
   * @constructor
   */
  public static fromString(sheet: FlSheet, selection: string): FlSheetSelectionFull {
    const coords: string[] = selection.split(FlSpreadsheetHelper.coordSplitter);
    const from: FlCellCoord = FlSpreadsheetHelper.coordFromString(coords[0]);
    const to: FlCellCoord = FlSpreadsheetHelper.coordFromString(coords[1]);
    // todo a voir pour le type multiple
    return new FlSheetSelectionFull(sheet, 'multiple', from.row, from.column,
      to.row, to.column);
  }

  // return a new instance of FlSheetSelectionChange wih expanded selection
  public expandSelection(row: number, column: number): FlSheetSelectionFull {
    return FlSheetSelectionFull.Multiple(this.sheet, this.startRow, this.startColumn, row, column);
  }

  // return a new instance of FlSheetSelectionChange wih expanded selection
  public expandRowsSelection(row: number): FlSheetSelectionFull {
    return FlSheetSelectionFull.Rows(this.sheet, this.startRow, row);
  }

  // return a new instance of FlSheetSelectionChange wih expanded selection
  public expandColumnsSelection(column: number): FlSheetSelectionFull {
    return FlSheetSelectionFull.Columns(this.sheet, this.startColumn, column);
  }

  public getEndCoord(): FlCellCoord {
    return {
      row: this.endRow,
      column: this.endColumn
    };
  }
}


export interface FlCellCoord {
  row: number;
  column: number;
}

export interface FlCellWithCoord {
  coord: FlCellCoord;
  cell: FlCell;
}

export type FlHeaderCellType = 'row' | 'column';
