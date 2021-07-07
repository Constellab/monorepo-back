import {FlSheetAction} from './fl-sheet.action';
import {FlSheet} from '../fl-sheet.class';
import {FlSheetRange} from '../selection/fl-sheet-range.class';

/**
 * Action to create a new Column
 */
export class FlAddColumnAction extends FlSheetAction {

  constructor(sheetId: number, range: FlSheetRange) {
    super(sheetId, range);
    this.disabledSelectionAfterAction = true;
  }

  execute(sheet: FlSheet): boolean {
    sheet.insertColumn(this.range.from.column);
    return true;
  }

  rollback(sheet: FlSheet): boolean {
    sheet.deleteColumns(this.range.from.column, this.range.to.column);
    return true;
  }
}


/**
 * Action to create a new Row
 */
export class FlAddRowAction extends FlSheetAction {

  constructor(sheetId: number, range: FlSheetRange) {
    super(sheetId, range);
    this.disabledSelectionAfterAction = true;
  }

  execute(sheet: FlSheet): boolean {
    sheet.insertRow(this.range.from.row);
    return true;
  }

  rollback(sheet: FlSheet): boolean {
    sheet.deleteRows(this.range.from.row, this.range.to.row);
    return true;
  }
}

/**
 * Action to delete columns
 */
export class FlDeleteColumnAction extends FlSheetAction {

  constructor(sheetId: number, range: FlSheetRange,
              private values: any[][]) {
    super(sheetId, range);
    this.disabledSelectionAfterAction = true;
  }

  execute(sheet: FlSheet): boolean {
    sheet.deleteColumns(this.range.from.column, this.range.to.column);
    return true;
  }

  rollback(sheet: FlSheet): boolean {
    // recreate the columns
    sheet.insertMultipleColumns(this.range.from.column, this.range.to.column);

    sheet.setValuesFromCoord(this.values, this.range.from);
    return true;
  }
}

/**
 * Action to delete rows
 */
export class FlDeleteRowAction extends FlSheetAction {

  constructor(sheetId: number, range: FlSheetRange,
              private values: any[][]) {
    super(sheetId, range);
    this.disabledSelectionAfterAction = true;
  }

  execute(sheet: FlSheet): boolean {
    sheet.deleteRows(this.range.from.row, this.range.to.row);
    return true;
  }

  rollback(sheet: FlSheet): boolean {
    // recreate the columns
    sheet.insertMultipleRows(this.range.from.row, this.range.to.row);

    sheet.setValuesFromCoord(this.values, this.range.from);
    return true;
  }
}

