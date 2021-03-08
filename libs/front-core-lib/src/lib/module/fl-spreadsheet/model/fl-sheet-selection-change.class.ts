import {FlCell} from '@monorepo/front-core-lib';

export type FlSheetSelectionType = 'single' | 'multiple' | 'columns' | 'rows';


export type FlSheetSelectionDirection = 'normal' | 'reverse';


export class FlSheetSelectionChange {


  private constructor(
    public type: FlSheetSelectionType,
    private startRow: number,
    private startColumn: number,
    private endRow: number,
    private endColumn: number) {
  }

  public static Single(row: number, column: number): FlSheetSelectionChange {
    return new FlSheetSelectionChange('single', row, column, row, column);
  }

  public static Multiple(startRow: number, startColumn: number,
                         endRow: number, endColumn: number): FlSheetSelectionChange {
    return new FlSheetSelectionChange('multiple', startRow, startColumn, endRow, endColumn);
  }

  public static Columns(from: number, to: number): FlSheetSelectionChange {
    return new FlSheetSelectionChange('columns', 0, from, Infinity, to);
  }

  public static Rows(from: number, to: number): FlSheetSelectionChange {
    return new FlSheetSelectionChange('rows', from, 0, to, Infinity);
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
  public expandSelection(row: number, column: number): FlSheetSelectionChange {
    return FlSheetSelectionChange.Multiple(this.startRow, this.startColumn, row, column);
  }

  // return a new instance of FlSheetSelectionChange wih expanded selection
  public expandRowsSelection(row: number): FlSheetSelectionChange {
    return FlSheetSelectionChange.Rows(this.startRow, row);
  }

  // return a new instance of FlSheetSelectionChange wih expanded selection
  public expandColumnsSelection(column: number): FlSheetSelectionChange {
    return FlSheetSelectionChange.Columns(this.startColumn, column);
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

export interface FlSheetSelectionDifference {
  row: number;
  column: number;
}

// selection change event specific for a cell
export interface FlSheetSelectionChangeCell {
  coord: FlCellCoord;
  range: FlSheetSelectionRange;
}

export interface FlCellWithCoord {
  coord: FlCellCoord;
  cell: FlCell;
}
