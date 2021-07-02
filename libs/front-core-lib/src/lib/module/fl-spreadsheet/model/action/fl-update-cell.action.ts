import {FlSheetSingleSelectionRange} from '../selection/fl-sheet-single-selection.class';
import {FlSheet} from '../fl-sheet.class';
import {FlSheetAction} from './fl-sheet.action';

/**
 * Sheet action to update multiple cells value
 */
export class FlUpdateCellsAction extends FlSheetAction {

  constructor(sheetId: number, range: FlSheetSingleSelectionRange,
              private newValues: any[][], private previousValues: any[][]) {
    super(sheetId, range);
  }

  execute(sheet: FlSheet): boolean {
    sheet.setValuesFromCoord(this.newValues, this.range.from);
    return true;
  }

  rollback(sheet: FlSheet): boolean {
    sheet.setValuesFromCoord(this.previousValues, this.range.from);
    return true;
  }
}

/**
 * Sheet action to update single cell value
 */
export class FlSingleUpdateCellAction extends FlUpdateCellsAction {

  constructor(sheetId: number, range: FlSheetSingleSelectionRange, newValue: any, previousValue: any,) {
    super(sheetId, range, [[newValue]], [[previousValue]]);
  }
}
