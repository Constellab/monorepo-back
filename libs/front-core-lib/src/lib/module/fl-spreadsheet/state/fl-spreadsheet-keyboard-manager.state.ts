import {Injectable, NgZone, OnDestroy, Renderer2} from '@angular/core';
import {FlSpreadsheetSelectionState} from './fl-spreadsheet-selection.state';
import {FlKeyboardHelper, FlKeyboardKey} from '../../../utils/fl-keyboard.helper';
import {FlSpreadsheetClipboardState} from './fl-spreadsheet-clipboard.state';
import {FlSpreadsheetActions} from './fl-spreadsheet-actions.state';
import {FlSpreadsheetActionStore} from './fl-spreadsheet-action.store';
import {FlSpreadsheetScrollState} from './fl-spreadsheet-scroll.state';
import {FlDeviceHelper} from '../../../utils/fl-device.helper';
import {FlSheetSingleSelection} from '../model/selection/fl-sheet-single-selection.class';

/**
 * Unique state shared across the spreadsheet to handle spreadsheet keyboard events
 */
@Injectable()
export class FlSpreadsheetKeyboardManagerState implements OnDestroy {

  private keyboardListener: () => void;

  constructor(private selectionState: FlSpreadsheetSelectionState,
              private renderer: Renderer2, private ngZone: NgZone,
              private clipboardState: FlSpreadsheetClipboardState,
              private actionState: FlSpreadsheetActions,
              private actionStore: FlSpreadsheetActionStore,
              private scrollState: FlSpreadsheetScrollState) {
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
    // console.log('Keydown', event.key, event.ctrlKey, event.altKey, event.shiftKey);
    // do nothing if the event was trigger from an input or textarea
    const targetTag: string = (event.target as HTMLElement).tagName;
    if (targetTag === 'INPUT' || targetTag === 'TEXTAREA') {
      return;
    }

    // ctrl key or mac command key
    if (event.ctrlKey || (event.metaKey && FlDeviceHelper.isMac())) {
      this.handleCtrlKeys(event);
    } else if (event.shiftKey) {
      this.handleShiftKeys(event);
    } else {
      this.handleSimpleKeys(event);
    }
  }

  private handleSimpleKeys(event: KeyboardEvent): void {
    if (event.key === FlKeyboardKey.DELETE) {
      this.handleDeleteKey();
    } else if (FlKeyboardHelper.keyboardKeyIsPrintable(event.key)) {
      this.handlePrintableKeys(event.key);
    } else if (event.key === FlKeyboardKey.ARROW_DOWN) {
      this.handleSimpleArrow(1, 0);
    } else if (event.key === FlKeyboardKey.ARROW_UP) {
      this.handleSimpleArrow(-1, 0);
    } else if (event.key === FlKeyboardKey.ARROW_LEFT) {
      this.handleSimpleArrow(0, -1);
    } else if (event.key === FlKeyboardKey.ARROW_RIGHT) {
      this.handleSimpleArrow(0, 1);
    } else if (event.key === FlKeyboardKey.PAGE_UP) {
      this.scrollState.scrollOnePage('up');
    } else if (event.key === FlKeyboardKey.PAGE_DOWN) {
      this.scrollState.scrollOnePage('down');
    }
  }


  private handleCtrlKeys(event: KeyboardEvent): void {
    // handle copy
    if (event.key === 'c') {
      this.handleCopy();
    }
    // handle paste
    else if (event.key === 'v') {
      this.handlePaste();
    } else if (event.key === 'z') {
      this.handleUndo();
    } else if (event.key === 'y' || event.key === 'Z') {
      this.handleRedo();
    }
  }

  private handleShiftKeys(event: KeyboardEvent): void {
    if (event.key === FlKeyboardKey.ARROW_DOWN) {
      this.handleShiftArrow(1, 0);
    } else if (event.key === FlKeyboardKey.ARROW_UP) {
      this.handleShiftArrow(-1, 0);
    } else if (event.key === FlKeyboardKey.ARROW_LEFT) {
      this.handleShiftArrow(0, -1);
    } else if (event.key === FlKeyboardKey.ARROW_RIGHT) {
      this.handleShiftArrow(0, 1);
    }
  }

  // Handler for the DELETE key
  private handleDeleteKey(): void {
    const selection: FlSheetSingleSelection = this.selectionState.currentSelection;

    if (selection != null) {
      // construct an array of null values the same size as the selection
      const cellsValues: void[][] = selection.getCells()
        .map((rows) => rows.map(() => null));
      this.actionState.updateCellsValues(cellsValues, selection);
    }
  }

  // Handler for printable keys
  // we pass the selected cell to the edit mode if not already
  private handlePrintableKeys(key: string): void {
    const selection: FlSheetSingleSelection = this.selectionState.currentSelection;

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

  private handleUndo(): void {
    this.actionStore.rollbackLastAction();
  }

  private handleRedo(): void {
    this.actionStore.redoLastAction();
  }

  private handleSimpleArrow(rowShift: number, columnShift: number): void {
    this.selectionState.moveCurrentSelection(rowShift, columnShift);
  }

  private handleShiftArrow(rowShift: number, columnShift: number): void {
    this.selectionState.expandSelectionWithShift(rowShift, columnShift);
  }

  ngOnDestroy(): void {
    this.keyboardListener();
  }


}
