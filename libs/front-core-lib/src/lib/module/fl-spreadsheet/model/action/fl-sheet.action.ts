import {FlSheet} from '../fl-sheet.class';
import {FlSheetSelectionRange} from '../fl-sheet-selection.class';

export abstract class FlSheetAction {

  // if true the selection is not reset after action undo/redo
  public disabledSelectionAfterAction: boolean = false;

  protected constructor(public sheetId: number, public range: FlSheetSelectionRange) {
  }

  abstract execute(sheet: FlSheet): boolean;

  abstract rollback(sheet: FlSheet): boolean;
}

