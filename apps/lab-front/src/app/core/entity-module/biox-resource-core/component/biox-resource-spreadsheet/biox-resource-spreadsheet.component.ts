import {Component, Input, OnInit} from '@angular/core';
import {BioxResource} from '../../../../model/entities/biox-resource.entity';
import {FlSpreadsheet} from '@monorepo/front-core-lib';

/**
 * Component to display a resource in a spreadsheet
 */
@Component({
  selector: 'gen-biox-resource-spreadsheet',
  templateUrl: './biox-resource-spreadsheet.component.html',
  styleUrls: ['./biox-resource-spreadsheet.component.scss']
})
export class BioxResourceSpreadsheetComponent implements OnInit {

  @Input() resource: BioxResource;

  spreadSheet: FlSpreadsheet;

  constructor() { }

  ngOnInit(): void {
    this.spreadSheet = new FlSpreadsheet('Sheet');

    const columnCount = 5;
    const rowCount = 5;

    for(let i = 0 ; i < columnCount; i++){
      this.spreadSheet.currentSheet.insertColumn();
    }

    for(let i = 0 ; i < rowCount; i++){
      this.spreadSheet.currentSheet.insertRow();
    }

    console.log(this.spreadSheet);
  }

}
