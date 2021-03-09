/**
 * Config object for the Context menu of a spread sheet
 */
import {FlSheetSelection, FlSheetSelectionRange} from '../model/fl-sheet-selection-change.class';
import {Injectable} from '@angular/core';
import {FlSpreadsheetSelectionState} from './fl-spreadsheet-selection.state';

export interface FlContextMenuConfig {
  buttons: FlContextMenuButton[];
}

/**
 * Configuration for one button in the Context Menu
 */
export interface FlContextMenuButton {
  text: string;
  icon: string;
  onClick: () => any;
}

/**
 * State to handle context menu
 * todo : change to service instead of state ?
 */
@Injectable()
export class FlSpreadsheetContextMenu {

  constructor(private selectionState: FlSpreadsheetSelectionState) {
  }

  /**
   * Get config for the header column based on a selection
   */
  public getConfigForHeaderColumn(): FlContextMenuConfig {
    const selection: FlSheetSelection = this.selectionState.currentSelection;
    const range: FlSheetSelectionRange = selection.selectionRange();

    return {
      buttons: [
        // button to create a column
        {
          text: 'add',
          icon: 'add',
          onClick: () => {
            selection.sheet.insertColumn(range.from.column);
            // clear selection after to avoid weird selection
            this.selectionState.clearCurrentSelection();
          }
        },
        // button to delete columns
        {
          text: 'delete',
          icon: 'delete',
          onClick: () => {
            selection.sheet.deleteColumns(range.from.column, range.to.column);
            // clear selection after to avoid weird selection
            this.selectionState.clearCurrentSelection();
          }
        }
      ]
    };
  }

  /**
   * Get config for the header row based on a selection
   */
  public getConfigForHeaderRow(): FlContextMenuConfig {
    const selection: FlSheetSelection = this.selectionState.currentSelection;
    const range: FlSheetSelectionRange = selection.selectionRange();
    return {
      buttons: [
        // button to create a row
        {
          text: 'add',
          icon: 'add',
          onClick: () => {
            selection.sheet.insertRow(range.from.row);
            // clear selection after to avoid weird selection
            this.selectionState.clearCurrentSelection();
          }
        },
        // button to delete rows
        {
          text: 'delete',
          icon: 'delete',
          onClick: () => {
            selection.sheet.deleteRows(range.from.row, range.to.row);
            // clear selection after to avoid weird selection
            this.selectionState.clearCurrentSelection();
          }
        }
      ]
    };
  }


}
