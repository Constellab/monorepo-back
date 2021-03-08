import {ChangeDetectionStrategy, Component, Input, OnDestroy, OnInit, Renderer2} from '@angular/core';
import {FlSpreadsheet} from '../../model/fl-spreadsheet.class';
import {FlCell} from '../../model/fl-cell.class';
import {Observable} from 'rxjs';
import {FlSpreadsheetState} from '../../state/fl-spreadsheet-state.service';

@Component({
  selector: 'fl-spreadsheet',
  templateUrl: './fl-spreadsheet.component.html',
  styleUrls: ['./fl-spreadsheet.component.scss'],
  providers: [FlSpreadsheetState],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FlSpreadsheetComponent implements OnInit, OnDestroy {

  @Input() spreadsheet: FlSpreadsheet;

  headerColumns: Observable<FlCell[]>;
  cells: Observable<FlCell[][]>;


  headerTop = '0px';

  private mouseUpListener: () => void;

  constructor(private state: FlSpreadsheetState,
              private renderer: Renderer2) {
  }

  ngOnInit(): void {
    this.state.init(this.spreadsheet);
    this.headerColumns = this.spreadsheet.currentSheet.getColumnHeaderCells();
    this.cells = this.spreadsheet.currentSheet.getCells();

    // listen to mouseup event to clear current selection
    this.mouseUpListener = this.renderer.listen('window', 'mouseup', () => this.state.endSelection());
  }


  ngOnDestroy(): void {
    this.mouseUpListener();
  }


}
