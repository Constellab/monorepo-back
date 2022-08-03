import {FlSheet} from '../fl-sheet.class';
import {FlCell} from '../fl-cell.class';
import {FlSheetSelection} from './fl-sheet-selection.class';
import {FlCellsRange, FlCellsRangeType} from './fl-cells-range.class';
import {FlCellCoord, FlCellCoordRange} from '../fl-cell-coord.class';
import {FlSheetSelectionRange} from '../chart/fl-sheet-chart-selection-form.class';

export interface FlCellWithCoord {
  coord: FlCellCoord;
  cell: FlCell;
}


/**
 * Class containing the selection of a sheet with only read method
 * This object is immutable
 */
export class FlSheetSingleSelection implements FlSheetSelection {

  protected constructor(
    protected sheet: FlSheet,
    protected range: FlCellsRange) {
  }


  public getCellsFlat(): FlCell[] {
    return this.sheet.getCellsFromCoordsFlat(this.range.from, this.range.to);
  }

  public getCells(): FlCell[][] {
    return this.sheet.getCellsFromCoords(this.range.from, this.range.to);
  }

  public getCellsValues(): any[][] {
    return this.getCells().map(rows => rows.map(cell => cell.value));
  }

  public getCellsValuesFlat(): any[] {
    return this.getCellsFlat().map(cell => cell.value);
  }

  /**
   * return the first column where the selection started
   * If this is a row or a column selection, we return the first column
   */
  public getFirstSelectedCell(): FlCell {
    const coord: FlCellCoord = this.range.getFirstSelectedCellCoord();
    return this.sheet.getCell(coord.row, coord.column);
  }

  /**
   * return a list of selection, one for each row
   */
  public splitToRowSelections(): FlSheetSingleSelection[] {
    const selections: FlSheetSingleSelection[] = [];
    const from: FlCellCoord = this.range.from;
    const to: FlCellCoord = this.range.to;

    for (let i = from.row; i <= to.row; i++) {
      selections.push(FlSheetSingleSelectionFull.Multiple(this.sheet, i, from.column, i, to.column));
    }

    return selections;
  }

  /**
   * return a list of selection, one for each column
   */
  public splitToColumnSelections(): FlSheetSingleSelection[] {
    const selections: FlSheetSingleSelection[] = [];
    const from: FlCellCoord = this.range.from;
    const to: FlCellCoord = this.range.to;

    // if there is only one row selection, we return only one row
    if (from.row === to.row) {
      return [FlSheetSingleSelectionFull.Multiple(this.sheet, from.row, from.column, to.row, to.column)];
    }

    for (let i = from.column; i <= to.column; i++) {
      selections.push(FlSheetSingleSelectionFull.Multiple(this.sheet, from.row, i, to.row, i));
    }

    return selections;
  }

  public get startRow(): number {
    return this.range.startRow;
  }

  public get startColumn(): number {
    return this.range.startColumn;
  }

  public get endRow(): number {
    return this.range.endRow;
  }

  public get endColumn(): number {
    return this.range.endColumn;
  }

  public get type(): FlCellsRangeType {
    return this.range.type;
  }

  public get from(): FlCellCoord {
    return this.range.from;
  }

  public get to(): FlCellCoord {
    return this.range.to;
  }

  public getRange(): FlCellsRange {
    return this.range;
  }

  public getFirstSelectedCellCoord(): FlCellCoord {
    return this.range.getFirstSelectedCellCoord();

  }

  // return true if the coord are within the selection
  public coordIsSelected(coord: FlCellCoord): boolean {
    return this.range.coordIsSelected(coord);

  }

  // return true if the row is within selection
  public rowIsSelected(row: number): boolean {
    return this.range.rowIsSelected(row);
  }

  // return true if the column is within selection
  public columnIsSelected(column: number): boolean {
    return this.range.columnIsSelected(column);
  }

  // return selection as text like B2:G5
  public toString(): string {
    return this.range.toString();
  }

  /**
   * Export to a FlSheetSelectionRange and includes the offset of the sheet
   */
  public toFlSheetSelectionRange(): FlSheetSelectionRange {
    if (this.type === 'columns') {
      return {
        type: 'columns',
        selection: this.sheet.getColumnNames(this.from.column, this.to.column)
      };
    } else {
      const coords = this.getRange().toCoords();
      return {
        type: 'range',
        selection: [{
          from: this.sheet.getCoordsWithOffset(coords.from),
          to: this.sheet.getCoordsWithOffset(coords.to)
        }]
      };
    }
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
 * Class containing the selection of a sheet with only also update method
 * This object is immutable, it returns new objects
 */
export class FlSheetSingleSelectionFull extends FlSheetSingleSelection {
  constructor(
    sheet: FlSheet,
    range: FlCellsRange) {
    super(sheet, range);
  }

  public static Single(sheet: FlSheet, row: number, column: number): FlSheetSingleSelectionFull {
    return new FlSheetSingleSelectionFull(sheet, new FlCellsRange('single', row, column, row, column));
  }

  public static Multiple(sheet: FlSheet,
                         startRow: number, startColumn: number,
                         endRow: number, endColumn: number): FlSheetSingleSelectionFull {
    return new FlSheetSingleSelectionFull(sheet, new FlCellsRange('multiple', startRow, startColumn, endRow, endColumn));
  }

  public static Columns(sheet: FlSheet, from: number, to: number): FlSheetSingleSelectionFull {
    return new FlSheetSingleSelectionFull(sheet, new FlCellsRange('columns', 0, from, sheet.getLoadedRowsCount() - 1, to));
  }

  public static ColumnName(sheet: FlSheet, columnName: string): FlSheetSingleSelectionFull {
    const index = sheet.findColumnIndex(columnName);

    if (index === -1) {
      throw new Error(`Column '${columnName}' not found`);
    }

    return FlSheetSingleSelectionFull.Columns(sheet, index, index);
  }

  public static Rows(sheet: FlSheet, from: number, to: number): FlSheetSingleSelectionFull {
    return new FlSheetSingleSelectionFull(sheet, new FlCellsRange('rows', from, 0, to, sheet.getLoadedColumnsCount() - 1));
  }

  public static FromRange(sheet: FlSheet, range: FlCellsRange): FlSheetSingleSelectionFull {
    return new FlSheetSingleSelectionFull(sheet, range);
  }

  public static FromCellCoordsRange(sheet: FlSheet, cellsRange: FlCellCoordRange): FlSheetSingleSelectionFull {
    const range = FlCellsRange.MultipleFromCellCoordsRange(cellsRange);
    range.to.column -= sheet.columnOffset;
    range.to.row -= sheet.rowOffset;
    range.from.column -= sheet.columnOffset;
    range.from.row -= sheet.rowOffset;
    return new FlSheetSingleSelectionFull(sheet, range);
  }

  /**
   * create selection from string formatted like A2:B5
   * @param sheet
   * @param selection
   * @constructor
   */
  public static fromString(sheet: FlSheet, selection: string): FlSheetSingleSelectionFull {
    return new FlSheetSingleSelectionFull(sheet, FlCellsRange.MultipleFromString(selection));
  }

  // return a new instance of FlSheetSelectionChange wih expanded selection
  public expandSelection(row: number, column: number): FlSheetSingleSelectionFull {
    return FlSheetSingleSelectionFull.Multiple(this.sheet, this.range.startRow, this.range.startColumn, row, column);
  }

  // return a new instance of FlSheetSelectionChange wih expanded selection
  public expandRowsSelection(row: number): FlSheetSingleSelectionFull {
    return FlSheetSingleSelectionFull.Rows(this.sheet, this.range.startRow, row);
  }

  // return a new instance of FlSheetSelectionChange wih expanded selection
  public expandColumnsSelection(column: number): FlSheetSingleSelectionFull {
    return FlSheetSingleSelectionFull.Columns(this.sheet, this.range.startColumn, column);
  }

  public getEndCoord(): FlCellCoord {
    return {
      row: this.range.endRow,
      column: this.range.endColumn
    };
  }
}
