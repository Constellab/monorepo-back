import {
  ChangeDetectionStrategy,
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
import {FlSpreadsheetChartState} from '../../state/fl-spreadsheet-chart.state';
import {FlPortalService} from '../../../fl-portal/service/fl-portal.service';
import {FlSpreadsheetScrollState} from '../../state/fl-spreadsheet-scroll.state';
import {Observable} from 'rxjs';
import {FlSpreadsheetRendererState} from '../../state/fl-spreadsheet-renderer-state.service';
import {map} from 'rxjs/operators';
import {FlSheetHeader, FlSheetRow} from '../../model/fl-sheet-headers.class';

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
    FlSpreadsheetRendererState,
    FlPortalService, // providers to access the state in portal
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FlSpreadsheetComponent implements OnInit, OnDestroy {

  @Input() spreadsheet: FlSpreadsheet;

  @Input() readOnly: boolean = false;

  @ViewChild('tableContainer', {static: true}) tableContainer: ElementRef<HTMLElement>;
  @ViewChild('horizontalScroller', {static: true}) horizontalScroller: ElementRef<HTMLElement>;
  @ViewChild('scroller', {static: true}) scroller: ElementRef<HTMLElement>;
  @ViewChild('heightSimulator', {static: true}) heightSimulator: ElementRef<HTMLElement>;

  headerColumns: FlCell[];

  columns$: Observable<FlSheetHeader[]>;
  rows$: Observable<FlSheetRow[]>;


  constructor(private state: FlSpreadsheetState,
              private selectionState: FlSpreadsheetSelectionState,
              private keyboardState: FlSpreadsheetKeyboardManagerState,
              private mouseState: FlSpreadsheetMouseManagerState,
              private scrollState: FlSpreadsheetScrollState) {
  }


  ngOnInit(): void {
    this.state.init(this.spreadsheet, this.readOnly);
    this.selectionState.init();
    this.keyboardState.init();
    this.mouseState.init();
    this.scrollState.init(this.tableContainer.nativeElement, this.scroller.nativeElement,
      this.heightSimulator.nativeElement, this.horizontalScroller.nativeElement);

    this.columns$ = this.state.getCurrentSheetColumns$().pipe(
      // add the first column corresponding to the row header
      map(columns => [{index: -1, name: '', tags: {}}, ...columns])
    );
    this.rows$ = this.scrollState.getRowsToDisplay$();
  }

  trackRowById: TrackByFunction<FlSheetRow> = (index: number, header: FlSheetHeader) => header.index;
  trackHeaderById: TrackByFunction<FlSheetHeader> = (index: number, header: FlSheetHeader) => header.index;


  ngOnDestroy(): void {
    this.scrollState.clear();
  }
}
