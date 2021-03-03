import {Component, Input, OnInit} from '@angular/core';

@Component({
  selector: 'fl-spreadsheet-header-cell',
  templateUrl: './fl-spreadsheet-header-cell.component.html',
  styleUrls: ['./fl-spreadsheet-header-cell.component.scss']
})
export class FlSpreadsheetHeaderCellComponent implements OnInit {

  @Input() value: any;

  constructor() { }

  ngOnInit(): void {
  }

}
