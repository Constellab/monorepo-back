import {FlSheetSelectionRange} from '../fl-sheet-selection.class';
import {FlSheet} from '../fl-sheet.class';
import {FlSheetAction} from './fl-sheet.action';

/**
 * Sheet action to update multiple cells value
 */
export class FlUpdateCellsAction extends FlSheetAction {

  constructor(sheetId: number, range: FlSheetSelectionRange,
              private newValues: any[][], private previousValues: any[][]) {
    super(sheetId, range);
  }

  execute(sheet: FlSheet): boolean {
    sheet.setValuesFromRange(this.newValues, this.range);
    return true;
  }

  rollback(sheet: FlSheet): boolean {
    sheet.setValuesFromRange(this.previousValues, this.range);
    return true;
  }
}

/**
 * Sheet action to update single cell value
 */
export class FlSingleUpdateCellAction extends FlUpdateCellsAction {

  constructor(sheetId: number, range: FlSheetSelectionRange, newValue: any, previousValue: any,) {
    super(sheetId, range, [[newValue]], [[previousValue]]);
  }
}
