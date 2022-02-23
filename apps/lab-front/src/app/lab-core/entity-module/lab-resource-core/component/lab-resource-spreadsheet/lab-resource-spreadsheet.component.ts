import {Component, Input, OnInit} from '@angular/core';
import {FlSheet, FlSpreadsheet, FlSpreadsheetFactory} from '@monorepo/front-core-lib';
import {LabResourceViewDirective} from '../../model/lab-resource-view-component.class';
import {LabResourceViewTable} from '../../../../model/entities/resource/lab-resource-view.entity';

/**
 * Component to display a resource in a spreadsheet
 */
@Component({
  selector: 'lab-resource-spreadsheet',
  templateUrl: './lab-resource-spreadsheet.component.html',
  styleUrls: ['./lab-resource-spreadsheet.component.scss'],
})
export class LabResourceSpreadsheetComponent extends LabResourceViewDirective<LabResourceViewTable> implements OnInit {

  @Input() view: LabResourceViewTable;

  spreadSheet: FlSpreadsheet;

  ngOnInit(): void {
    const spreadSheet: FlSpreadsheet = new FlSpreadsheet();
    // if the resource is a csv file
    const sheet: FlSheet = FlSpreadsheetFactory.fromArray(this.view.data, 'Sheet 1');

    spreadSheet.addSheet(sheet);

    this.spreadSheet = spreadSheet;
  }

}
