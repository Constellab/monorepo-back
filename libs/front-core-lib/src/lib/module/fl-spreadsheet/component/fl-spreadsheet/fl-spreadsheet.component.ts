import {ChangeDetectionStrategy, Component, Input, OnDestroy, OnInit, Renderer2} from '@angular/core';
import {FlSpreadsheet} from '../../model/fl-spreadsheet.class';
import {FlCell} from '../../model/fl-cell.class';
import {Observable} from 'rxjs';
import {FlSpreadsheetSelectionState} from '../../state/fl-spreadsheet-selection.state';
import {map} from 'rxjs/operators';
import {FlSpreadsheetState} from '../../state/fl-spreadsheet.state';
import {FlSpreadsheetContextMenu} from '../../state/fl-spreadsheet-context-menu.state';
import {FlSpreadsheetKeyboardManagerState} from '../../state/fl-spreadsheet-keyboard-manager.state';

@Component({
  selector: 'fl-spreadsheet',
  templateUrl: './fl-spreadsheet.component.html',
  styleUrls: ['./fl-spreadsheet.component.scss'],
  providers: [
    FlSpreadsheetState,
    FlSpreadsheetSelectionState,
    FlSpreadsheetContextMenu,
    FlSpreadsheetKeyboardManagerState
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FlSpreadsheetComponent implements OnInit, OnDestroy {

  @Input() spreadsheet: FlSpreadsheet;

  headerColumns: Observable<FlCell[]>;
  cells: Observable<FlCell[][]>;

  private mouseUpListener: () => void;

  constructor(private state: FlSpreadsheetState,
              private selectionState: FlSpreadsheetSelectionState,
              private keyboardState: FlSpreadsheetKeyboardManagerState,
              private renderer: Renderer2) {
  }

  ngOnInit(): void {

    this.state.init(this.spreadsheet);
    this.keyboardState.init();
    this.headerColumns = this.spreadsheet.currentSheet.getColumnHeaderCells();
    //create a new instance of the cells array for the virtual scroll
    this.cells = this.spreadsheet.currentSheet.getCells().pipe(map(cells => [...cells]));

    // listen to mouseup event to clear current selection
    this.mouseUpListener = this.renderer.listen('window', 'mouseup', () => this.selectionState.endSelection());
  }


  ngOnDestroy(): void {
    this.mouseUpListener();
  }


}
