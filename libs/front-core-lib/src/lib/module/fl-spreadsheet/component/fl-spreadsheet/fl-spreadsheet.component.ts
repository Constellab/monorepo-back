import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  Input,
  OnDestroy,
  OnInit,
  TrackByFunction,
  ViewChild
} from '@angular/core';
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
import {FlSpreadsheetChartState} from '../../state/fl-spreadsheet-chart.state';
import {FlPortalService} from '../../../fl-portal/service/fl-portal.service';
import {FlSpreadsheetScrollState} from '../../state/fl-spreadsheet-scroll.state';
import {Observable} from 'rxjs';
import {FlSheetRow} from '../../model/fl-sheet-row.class';

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
    FlSpreadsheetChartState,
    FlSpreadsheetScrollState,
    FlPortalService, // providers to access the state in portal
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FlSpreadsheetComponent implements OnInit, OnDestroy {

  @Input() spreadsheet: FlSpreadsheet;

  @ViewChild('tableContainer', {static: true}) tableContainer: ElementRef<HTMLElement>;
  @ViewChild('scroller', {static: true}) scroller: ElementRef<HTMLElement>;
  @ViewChild('heightSimulator', {static: true}) heightSimulator: ElementRef<HTMLElement>;

  headerColumns: FlCell[];

  rows$: Observable<FlSheetRow[]>;


  private subscription: ClSubscriptionHandler = new ClSubscriptionHandler();

  constructor(private state: FlSpreadsheetState,
              private selectionState: FlSpreadsheetSelectionState,
              private keyboardState: FlSpreadsheetKeyboardManagerState,
              private mouseState: FlSpreadsheetMouseManagerState,
              private scrollState: FlSpreadsheetScrollState,
              private cdr: ChangeDetectorRef) {
  }

  ngOnInit(): void {
    this.state.init(this.spreadsheet);
    this.keyboardState.init();
    this.mouseState.init();
    this.scrollState.init(this.tableContainer, this.scroller, this.heightSimulator);
    this.subscribeToHeader();

    this.rows$ = this.scrollState.getRowsToDisplay$();
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

  trackByRowsId: TrackByFunction<FlSheetRow> = (index: number, row: FlSheetRow) => row.rowId;


  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
    this.scrollState.clear();
  }
}
