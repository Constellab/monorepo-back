import {Component, Input, OnInit} from '@angular/core';
import {FlSpreadsheet} from '../../model/fl-spreadsheet.class';
import {FlCell} from '../../model/fl-cell.class';
import {Observable} from 'rxjs';
import {clRxjsDebug} from '@monorepo/core-lib';

@Component({
  selector: 'fl-spreadsheet',
  templateUrl: './fl-spreadsheet.component.html',
  styleUrls: ['./fl-spreadsheet.component.scss']
})
export class FlSpreadsheetComponent implements OnInit {

  @Input() spreadsheet: FlSpreadsheet;

  columns: Observable<FlCell[]>;
  cells: Observable<FlCell[][]>;

  constructor() { }

  ngOnInit(): void {
    this.columns = this.spreadsheet.currentSheet.getColumnHeaderCells().pipe(clRxjsDebug());
    this.cells = this.spreadsheet.currentSheet.getCells();
  }

}
