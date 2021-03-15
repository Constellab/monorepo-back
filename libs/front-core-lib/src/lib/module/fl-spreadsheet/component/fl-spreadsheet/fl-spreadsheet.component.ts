import {ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, OnDestroy, OnInit} from '@angular/core';
import {FlSpreadsheet} from '../../model/fl-spreadsheet.class';
import {FlCell} from '../../model/fl-cell.class';
import {FlSpreadsheetSelectionState} from '../../state/fl-spreadsheet-selection.state';
import {FlSpreadsheetState} from '../../state/fl-spreadsheet.state';
import {FlSpreadsheetContextMenu} from '../../state/fl-spreadsheet-context-menu.state';
import {FlSpreadsheetKeyboardManagerState} from '../../state/fl-spreadsheet-keyboard-manager.state';
import {FlSpreadsheetMouseManagerState} from '../../state/fl-spreadsheet-mouse-manager.state';
import {FlSpreadsheetClipboardState} from '../../state/fl-spreadsheet-clipboard.state';
import {FlSpreadsheetActions} from '../../state/fl-spreadsheet-actions.state';
import {FlSpreadsheetActionStore} from '../../state/fl-spreadsheet-action.store';
import {ClSubscriptionHandler} from '@monorepo/core-lib';

@Component({
  selector: 'fl-spreadsheet',
  templateUrl: './fl-spreadsheet.component.html',
  styleUrls: ['./fl-spreadsheet.component.scss'],
  providers: [
    FlSpreadsheetState,
    FlSpreadsheetSelectionState,
    FlSpreadsheetContextMenu,
    FlSpreadsheetKeyboardManagerState,
    FlSpreadsheetMouseManagerState,
    FlSpreadsheetClipboardState,
    FlSpreadsheetActionStore,
    FlSpreadsheetActions,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FlSpreadsheetComponent implements OnInit, OnDestroy {

  @Input() spreadsheet: FlSpreadsheet;

  headerColumns: FlCell[];
  cells: FlCell[][];


  subscription: ClSubscriptionHandler = new ClSubscriptionHandler();

  constructor(private state: FlSpreadsheetState,
              private selectionState: FlSpreadsheetSelectionState,
              private keyboardState: FlSpreadsheetKeyboardManagerState,
              private mouseState: FlSpreadsheetMouseManagerState,
              private cdr: ChangeDetectorRef) {
  }

  ngOnInit(): void {
    this.state.init(this.spreadsheet);
    this.keyboardState.init();
    this.mouseState.init();
    this.subscribeToHeader();
    this.subscribeToCells();
  }

  private subscribeToHeader(): void {
    this.subscription.add(this.spreadsheet.currentSheet.getColumnHeaderCells().subscribe(
      cells => this.onNewHeader(cells)
    ));
  }

  private onNewHeader(headers: FlCell[]): void {
    this.headerColumns = headers;
    this.cdr.detectChanges();
  }

  private subscribeToCells(): void {
    this.subscription.add(this.spreadsheet.currentSheet.getCells().subscribe(
      cells => this.onNewCells(cells)
    ));
  }

  private onNewCells(cells: FlCell[][]): void {
    //create a new instance of the cells array for the virtual scroll
    this.cells = [...cells];
    this.cdr.detectChanges();
  }


  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
  }


}
