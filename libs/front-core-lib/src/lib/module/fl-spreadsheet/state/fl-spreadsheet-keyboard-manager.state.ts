import {Injectable, OnDestroy, Renderer2} from '@angular/core';
import {FlSpreadsheetSelectionState} from './fl-spreadsheet-selection.state';
import {FlKeyboardHelper, FlKeyboardKey} from '../../../utils/fl-keyboard.helper';
import {FlSheetSelection} from '../model/fl-sheet-selection.class';
import {FlCell} from '../model/fl-cell.class';

/**
 * Unique state shared across the spreadsheet to handle spreadsheet events
 */
@Injectable()
export class FlSpreadsheetKeyboardManagerState implements OnDestroy {

  private keyboardListener: () => void;

  constructor(private selectionState: FlSpreadsheetSelectionState,
              private renderer: Renderer2) {
  }

  public init(): void {
    if (this.keyboardListener != null) {
      console.error('The init method must be called only once');
      return;
    }
    this.keyboardListener = this.renderer.listen('body', 'keydown',
      (event: KeyboardEvent) => this.onKeydown(event));
  }

  private onKeydown(event: KeyboardEvent): void {
    console.log('Keydown', event.key, event.ctrlKey, event.altKey);

    if (event.ctrlKey) {
      this.handleCtrlKeys(event);
    } else if (event.altKey) {
      this.handleAltKeys(event);
    } else {
      this.handleSimpleKeys(event);
    }
  }

  private handleSimpleKeys(event: KeyboardEvent): void {
    if (event.key === FlKeyboardKey.DELETE) {
      this.handleDeleteKey();
    } else if (FlKeyboardHelper.keyboardKeyIsPrintable(event.key)) {
      this.handlePrintableKeys(event.key);
    }
  }


  private handleCtrlKeys(event: KeyboardEvent): void {

  }

  private handleAltKeys(event: KeyboardEvent): void {

  }

  // Handler for the DELETE key
  private handleDeleteKey(): void {
    const selection: FlSheetSelection = this.selectionState.currentSelection;

    if (selection != null) {
      const selectedCells: FlCell[] = selection.getSelectedCells();
      for (const cell of selectedCells) {
        cell.value = null;
      }
    }
  }

  // Handler for printable keys
  // we pass the selected cell to the edit mode if not already
  private handlePrintableKeys(key: string): void {
    const selection: FlSheetSelection = this.selectionState.currentSelection;

    if (selection != null) {
      const cell = selection.getFirstSelectedCell();
      cell.setEdit(true, key);
    }
  }

  ngOnDestroy(): void {
    this.keyboardListener();
  }


}
