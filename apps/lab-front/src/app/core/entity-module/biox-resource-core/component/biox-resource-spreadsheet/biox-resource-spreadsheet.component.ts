import {Component, Input, OnInit} from '@angular/core';
import {FlSheet, FlSpreadsheet, FlSpreadsheetFactory} from '@monorepo/front-core-lib';
import {BioxResourceViewDirective} from '../../model/biox-resource-view-component.class';
import {BioxResourceViewTable} from '../../../../model/entities/resource/biox-resource-view.entity';

/**
 * Component to display a resource in a spreadsheet
 */
@Component({
  selector: 'gen-biox-resource-spreadsheet',
  templateUrl: './biox-resource-spreadsheet.component.html',
  styleUrls: ['./biox-resource-spreadsheet.component.scss'],
})
export class BioxResourceSpreadsheetComponent extends BioxResourceViewDirective<BioxResourceViewTable> implements OnInit {

  @Input() view: BioxResourceViewTable;

  spreadSheet: FlSpreadsheet;

  ngOnInit(): void {
    const spreadSheet: FlSpreadsheet = new FlSpreadsheet();
    // if the resource is a csv file
    const sheet: FlSheet = FlSpreadsheetFactory.fromCsvJson(this.view.data, 'Sheet 1');

    spreadSheet.addSheet(sheet);

    this.spreadSheet = spreadSheet;
  }

}
