import {Injectable} from '@angular/core';
import {FlSheetAction} from '../model/action/fl-sheet.action';
import {FlSpreadsheetState} from './fl-spreadsheet.state';
import {FlCellCoord, FlSheetSelection, FlSheetSelectionFull} from '../model/fl-sheet-selection.class';
import {FlSheet} from '../model/fl-sheet.class';
import {FlCell} from '../model/fl-cell.class';
import {FlSpreadsheetSelectionState} from './fl-spreadsheet-selection.state';
import {FlSingleUpdateCellAction, FlUpdateCellsAction} from '../model/action/fl-update-cell.action';
import {FlSpreadsheetActionStore} from './fl-spreadsheet-action.store';
import {FlAddColumnAction, FlAddRowAction, FlDeleteColumnAction, FlDeleteRowAction} from '../model/action/fl-header-cell.action';


/**
 * Unique state shared across the spreadsheet to trigger update actions
 * All action must be set here to be able to revert it
 */
@Injectable()
export class FlSpreadsheetActions {


  constructor(private state: FlSpreadsheetState,
              private selectionState: FlSpreadsheetSelectionState,
              private actionStore: FlSpreadsheetActionStore) {
  }

  public updateCellValue(newValue: any, coord: FlCellCoord): void {
    const sheet: FlSheet = this.state.currentSheet;
    const cell: FlCell = sheet.getCell(coord.row, coord.column);

    const action: FlSheetAction = new FlSingleUpdateCellAction(sheet.id,
      FlSheetSelectionFull.Single(sheet, coord.row, coord.column).exportToRange(), newValue, cell.value);
    this.actionStore.executeNewAction(action);
  }


  public updateCellsValues(newValues: any[][], selection: FlSheetSelection): void {
    const sheet: FlSheet = this.state.currentSheet;

    const action: FlSheetAction = new FlUpdateCellsAction(sheet.id,
      selection.exportToRange(), newValues, selection.getCellsValues());
    this.actionStore.executeNewAction(action);
  }

  public addColumn(): void{
    const sheet: FlSheet = this.state.currentSheet;
    const selection: FlSheetSelection = this.selectionState.currentSelection;

    const action: FlSheetAction = new FlAddColumnAction(sheet.id, selection.exportToRange());

    // clear selection after to avoid weird selection
    // before the execution, otherwise the current selection is not correct
    this.selectionState.clearCurrentSelection();

    this.actionStore.executeNewAction(action);
  }

  public addRow(): void{
    const sheet: FlSheet = this.state.currentSheet;
    const selection: FlSheetSelection = this.selectionState.currentSelection;

    const action: FlSheetAction = new FlAddRowAction(sheet.id, selection.exportToRange());

    // clear selection after to avoid weird selection
    // before the execution, otherwise the current selection is not correct
    this.selectionState.clearCurrentSelection();

    this.actionStore.executeNewAction(action);
  }

  public deleteColumns(): void{
    const sheet: FlSheet = this.state.currentSheet;
    const selection: FlSheetSelection = this.selectionState.currentSelection;

    const action: FlSheetAction = new FlDeleteColumnAction(sheet.id,
      selection.exportToRange(), selection.getCellsValues());

    // clear selection after to avoid weird selection
    // before the execution, otherwise the current selection is not correct
    this.selectionState.clearCurrentSelection();

    this.actionStore.executeNewAction(action);
  }

  public deleteRows(): void{
    const sheet: FlSheet = this.state.currentSheet;
    const selection: FlSheetSelection = this.selectionState.currentSelection;

    const action: FlSheetAction = new FlDeleteRowAction(sheet.id,
      selection.exportToRange(), selection.getCellsValues());

    // clear selection after to avoid weird selection
    // before the execution, otherwise the current selection is not correct
    this.selectionState.clearCurrentSelection();

    this.actionStore.executeNewAction(action);
  }

}
