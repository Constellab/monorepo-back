import {FlCell, FlSheet} from '@monorepo/front-core-lib';

export type FlSheetSelectionType = 'single' | 'multiple' | 'columns' | 'rows';


export type FlSheetSelectionDirection = 'normal' | 'reverse';


export class FlSheetSelection {


  private constructor(
    public sheet: FlSheet,
    public type: FlSheetSelectionType,
    private startRow: number,
    private startColumn: number,
    private endRow: number,
    private endColumn: number) {
  }

  public static Single(sheet: FlSheet, row: number, column: number): FlSheetSelection {
    return new FlSheetSelection(sheet, 'single', row, column, row, column);
  }

  public static Multiple(sheet: FlSheet,
                         startRow: number, startColumn: number,
                         endRow: number, endColumn: number): FlSheetSelection {
    return new FlSheetSelection(sheet, 'multiple', startRow, startColumn, endRow, endColumn);
  }

  public static Columns(sheet: FlSheet, from: number, to: number): FlSheetSelection {
    return new FlSheetSelection(sheet, 'columns', 0, from, sheet.getRowsCount() - 1, to);
  }

  public static Rows(sheet: FlSheet, from: number, to: number): FlSheetSelection {
    return new FlSheetSelection(sheet, 'rows', from, 0, to, sheet.getColumnsCount() - 1);
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

  // return a new instance of FlSheetSelectionChange wih expanded selection
  public expandSelection(row: number, column: number): FlSheetSelection {
    return FlSheetSelection.Multiple(this.sheet, this.startRow, this.startColumn, row, column);
  }

  // return a new instance of FlSheetSelectionChange wih expanded selection
  public expandRowsSelection(row: number): FlSheetSelection {
    return FlSheetSelection.Rows(this.sheet, this.startRow, row);
  }

  // return a new instance of FlSheetSelectionChange wih expanded selection
  public expandColumnsSelection(column: number): FlSheetSelection {
    return FlSheetSelection.Columns(this.sheet, this.startColumn, column);
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
