import {Injectable} from '@angular/core';
import {FlSheetAction} from '../model/action/fl-sheet.action';
import {FlSpreadsheetState} from './fl-spreadsheet.state';
import {FlSpreadsheetSelectionState} from './fl-spreadsheet-selection.state';
import {FlSheet} from '../model/fl-sheet.class';

/**
 * Shared instance for a spreadsheet that store the actions
 * and can undo/redo actions
 */
@Injectable()
export class FlSpreadsheetActionStore {

  // number of saved action to undo/redo
  private readonly actionHistoryLength: number = 100;

  // list of stored action, the first one, is the last made
  private actions: FlSheetAction[] = [];

  // index of the current executed action
  private currentAction: number = 0;

  constructor(private state: FlSpreadsheetState,
              private selectionState: FlSpreadsheetSelectionState) {
  }

  public executeNewAction(action: FlSheetAction): void {
    this.executeAction(action);
    this.storeAction(action);
  }

  public redoLastAction(): void {
    if (this.currentAction <= 0) {
      return;
    }
    const action: FlSheetAction = this.actions[this.currentAction - 1];
    if (action == null) {
      return;
    }

    this.executeAction(action);
    this.currentAction--;

    if (!action.disabledSelectionAfterAction) {
      this.selectionState.setSelection(this.getSheet(action.sheetId), action.range);
    }
  }

  private executeAction(action: FlSheetAction): void {
    const sheet: FlSheet = this.getSheet(action.sheetId);

    if (sheet == null) {
      console.error(`Can't find the sheet with id ${action.sheetId}`);
      return;
    }
    action.execute(sheet);
  }

  public rollbackLastAction(): void {
    const action: FlSheetAction = this.actions[this.currentAction];
    if (action == null) {
      return;
    }
    const sheet: FlSheet = this.getSheet(action.sheetId);

    if (sheet == null) {
      console.error(`Can't find the sheet with id ${action.sheetId}`);
      return;
    }
    action.rollback(sheet);
    this.currentAction++;

    if (!action.disabledSelectionAfterAction) {
      this.selectionState.setSelection(sheet, action.range);
    }
  }

  private getSheet(id: number): FlSheet {
    return this.state.getSheet(id);
  }

  private storeAction(action: FlSheetAction): void {
    // clear all the action that were redo
    this.actions.splice(0, this.currentAction);

    this.actions.unshift(action);
    if (this.actions.length > this.actionHistoryLength) {
      // clear the last action for space memory
      this.actions.pop();
    }
    this.currentAction = 0;
  }
}
