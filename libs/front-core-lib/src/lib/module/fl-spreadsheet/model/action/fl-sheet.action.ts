import {FlSheet} from '../fl-sheet.class';
import {FlCellsRange} from '../selection/fl-cells-range.class';

export abstract class FlSheetAction {

  // if true the selection is not reset after action undo/redo
  public disabledSelectionAfterAction: boolean = false;

  protected constructor(public sheetId: number, public range: FlCellsRange) {
  }

  abstract execute(sheet: FlSheet): boolean;

  abstract rollback(sheet: FlSheet): boolean;
}

