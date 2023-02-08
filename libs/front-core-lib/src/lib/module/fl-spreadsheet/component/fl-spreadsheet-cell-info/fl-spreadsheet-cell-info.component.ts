import {Component, Inject, OnInit} from '@angular/core';
import {FL_PORTAL_DATA} from '../../../fl-portal/model/fl-portal.class';
import {FlCell} from '../../model/fl-cell.class';
import {FlCellWithCoord} from '../../model/selection/fl-sheet-single-selection.class';
import {FlSpreadsheetState} from '../../state/fl-spreadsheet.state';
import {FlSheetHeaderInfo} from '../../model/fl-sheet-headers.class';

/**
 * Small portal to show information about a cell
 */
@Component({
  selector: 'fl-spreadsheet-cell-info',
  templateUrl: './fl-spreadsheet-cell-info.component.html',
  styleUrls: ['./fl-spreadsheet-cell-info.component.scss']
})
export class FlSpreadsheetCellInfoComponent implements OnInit {

  cell: FlCell;

  columnInfo: FlSheetHeaderInfo;
  rowInfo: FlSheetHeaderInfo;

  constructor(@Inject(FL_PORTAL_DATA) cell: FlCellWithCoord,
              private state: FlSpreadsheetState) {
    this.cell = cell.cell;
    const coord = cell.coord;
    const sheet = state.currentSheet;
    this.columnInfo = sheet.getColumnInfo(coord.column);
    this.rowInfo = sheet.getRowInfo(coord.row);
  }

  ngOnInit(): void {
  }

}
