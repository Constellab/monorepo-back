import {FlCell, FlSheet} from '@monorepo/front-core-lib';

export type FlSheetSelectionFullype = 'single' | 'multiple' | 'columns' | 'rows';


export type FlSheetSelectionDirection = 'normal' | 'reverse';

/**
 * Class containing the selection of a spreadsheet with only read method
 * This object is immutable
 */
export abstract class FlSheetSelection {

  protected constructor(
    public sheet: FlSheet,
    public type: FlSheetSelectionFullype,
    protected startRow: number,
    protected startColumn: number,
    protected endRow: number,
    protected endColumn: number) {
  }

  /**
   * Return the selection range in order ('from' <= 'to)
   */
  public selectionRange(): FlSheetSelectionRange {
    return {
      from: {
        row: Math.min(this.startRow, this.endRow),
        column: Math.min(this.startColumn, this.endColumn)
      },
      to: {
        row: Math.max(this.startRow, this.endRow),
        column: Math.max(this.startColumn, this.endColumn)
      }
    };
  }

  private get rowDirection(): FlSheetSelectionDirection {
    return this.startRow <= this.endRow ? 'normal' : 'reverse';
  }

  private get columnDirection(): FlSheetSelectionDirection {
    return this.startColumn <= this.endColumn ? 'normal' : 'reverse';
  }

  public getSelectedCells(): FlCell[] {
    return this.sheet.getCellsFromRange(this.selectionRange());
  }

  /**
   * return the first column where the selection started
   * If this is a row or a column selection, we return the first column
   */
  public getFirstSelectedCell(): FlCell | null {
    if (this.type === 'columns') {
      return this.sheet.getCell(0, this.startColumn);
    } else if (this.type === 'rows') {
      return this.sheet.getCell(this.startRow, 0);
    } else {
      return this.sheet.getCell(this.startRow, this.startColumn);
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
 * Class containing the selection of a spreadsheet with only also update method method
 * This object is immutable
 */
export class FlSheetSelectionFull extends FlSheetSelection {
  protected constructor(
    public sheet: FlSheet,
    public type: FlSheetSelectionFullype,
    protected startRow: number,
    protected startColumn: number,
    protected endRow: number,
    protected endColumn: number) {
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
}


/**
 * Object representing a selection range
 * The 'from' coord are lower or equals than the 'to' coord
 */
export interface FlSheetSelectionRange {
  from: FlCellCoord;
  to: FlCellCoord;
}

export interface FlCellCoord {
  row: number;
  column: number;
}

export interface FlCellWithCoord {
  coord: FlCellCoord;
  cell: FlCell;
}
