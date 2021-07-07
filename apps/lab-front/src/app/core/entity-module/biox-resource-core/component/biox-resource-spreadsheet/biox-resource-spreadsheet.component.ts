import {Component, Input, OnInit} from '@angular/core';
import {BioxResource} from '../../../../model/entities/resource/biox-resource.entity';
import {FlSheet, FlSpreadsheet, FlSpreadsheetFactory} from '@monorepo/front-core-lib';
import {FileResourcePreview} from '../../../../model/entities/resource/file-resource.entity';

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

    const spreadSheet: FlSpreadsheet = new FlSpreadsheet();
    // if the resource is a csv file
    let sheet: FlSheet;
    if (this.resource instanceof FileResourcePreview && this.resource.getExtension() === 'csv') {
      sheet = FlSpreadsheetFactory.fromCSV(this.resource.data, 'Sheet 1');
    } else {
      sheet = FlSpreadsheetFactory.fromAny(this.resource.data, 'Sheet 1');
    }
    spreadSheet.addSheet(sheet);

    // spreadSheet.addSheet(FlSpreadsheetFactory.fromArray(data, 'Sheet 2'));

    this.spreadSheet = spreadSheet;
  }

}
