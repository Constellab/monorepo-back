import {Injectable, NgZone, OnDestroy, Renderer2} from '@angular/core';
import {FlSpreadsheetSelectionState} from './fl-spreadsheet-selection.state';
import {FlKeyboardHelper, FlKeyboardKey} from '../../../utils/fl-keyboard.helper';
import {FlSheetSelection} from '../model/fl-sheet-selection.class';
import {FlCell} from '../model/fl-cell.class';
import {FlSpreadsheetClipboardState} from './fl-spreadsheet-clipboard.state';

/**
 * Unique state shared across the spreadsheet to handle spreadsheet keyboard events
 */
@Injectable()
export class FlSpreadsheetKeyboardManagerState implements OnDestroy {

  private keyboardListener: () => void;

  constructor(private selectionState: FlSpreadsheetSelectionState,
              private renderer: Renderer2, private ngZone: NgZone,
              private clipboardState: FlSpreadsheetClipboardState) {
  }

  public init(): void {
    if (this.keyboardListener != null) {
      console.error('The init method must be called only once');
      return;
    }

    // run event listener outside angular zone to prevent automatic change detection
    this.ngZone.runOutsideAngular(() => {
      this.keyboardListener = this.renderer.listen('body', 'keydown',
        (event: KeyboardEvent) => this.onKeydown(event));
    });
  }

  private onKeydown(event: KeyboardEvent): void {
    console.log('Keydown', event.key, event.ctrlKey, event.altKey, event.shiftKey);

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
    // handle copy
    if (event.key === 'c') {
      this.handleCopy();
    }
    // handle paste
    else if (event.key === 'v') {
      console.log(event);
      this.handlePaste();
    }
  }

  private handleAltKeys(event: KeyboardEvent): void {

  }

  // Handler for the DELETE key
  private handleDeleteKey(): void {
    const selection: FlSheetSelection = this.selectionState.currentSelection;

    if (selection != null) {
      const selectedCells: FlCell[] = selection.getSelectedCellsFlat();
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

  private handleCopy(): void {
    this.clipboardState.copyCurrentSelectionToClipboard();
  }

  private handlePaste(): void {
    this.clipboardState.pasteClipboardValueToSelection();
  }

  ngOnDestroy(): void {
    this.keyboardListener();
  }


}
