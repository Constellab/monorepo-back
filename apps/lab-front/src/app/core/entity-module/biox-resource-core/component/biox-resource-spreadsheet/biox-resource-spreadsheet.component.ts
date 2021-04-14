import {Component, Input, OnInit} from '@angular/core';
import {BioxResource} from '../../../../model/entities/biox-resource.entity';
import {FlSpreadsheet} from '@monorepo/front-core-lib';

const data: any[][] = [
  ['Item', 2012, 2013, 2014, 2015, null, null, null, null, null],
  ['Desktop', 20, 12, 13, 12],
  ['Laptops', 34, 45, 40, 39],
  ['Monitors', 12, 10, 17, 15],
  ['Printers', 78, 13, 90, 14]
];

/**
 * Component to display a resource in a spreadsheet
 */
@Component({
  selector: 'gen-biox-resource-spreadsheet',
  templateUrl: './biox-resource-spreadsheet.component.html',
  styleUrls: ['./biox-resource-spreadsheet.component.scss'],
})
export class BioxResourceSpreadsheetComponent implements OnInit {

  @Input() resource: BioxResource;

  spreadSheet: FlSpreadsheet;

  constructor() {
  }

  ngOnInit(): void {
    this.spreadSheet = FlSpreadsheet.fromArray(data, 'Sheet');

    // const columnCount = 5;
    // const rowCount = 5;
    //
    // for (let i = 0; i < columnCount; i++) {
    //   this.spreadSheet.currentSheet.insertColumn();
    // }
    //
    // for (let i = 0; i < rowCount; i++) {
    //   this.spreadSheet.currentSheet.insertRow();
    // }

    console.log(this.spreadSheet);
  }

}
