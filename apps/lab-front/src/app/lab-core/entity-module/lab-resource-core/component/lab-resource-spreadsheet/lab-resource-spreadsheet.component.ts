import {Component, Input, OnInit} from '@angular/core';
import {
  FlSheet,
  FlSheetChartService,
  FlSheetHeaders,
  FlSpreadsheet,
  FlSpreadsheetFactory
} from '@monorepo/front-core-lib';
import {LabResourceViewDirective} from '../../model/lab-resource-view.directive';
import {LabResourceViewTable} from '../../../../model/entities/resource/lab-resource-view.entity';
import {LabResourceTableChartService} from '../../state/lab-resource-table-chart.service';

/**
 * Component to display a resource in a spreadsheet
 */
@Component({
  selector: 'lab-resource-spreadsheet',
  templateUrl: './lab-resource-spreadsheet.component.html',
  styleUrls: ['./lab-resource-spreadsheet.component.scss'],
  providers: [
    LabResourceTableChartService,
    {provide: FlSheetChartService, useExisting: LabResourceTableChartService}
  ]
})
export class LabResourceSpreadsheetComponent extends LabResourceViewDirective<LabResourceViewTable> implements OnInit {

  @Input() view: LabResourceViewTable;

  spreadSheet: FlSpreadsheet;

  constructor(private chartState: LabResourceTableChartService) {
    super();
  }

  ngOnInit(): void {
    // init the chart state so it knows the context
    this.chartState.init(this.resourceId,
      this.config.methodName,
      this.config.configValues,
      this.config.transformers);

    const spreadSheet: FlSpreadsheet = new FlSpreadsheet();
    // if the resource is a csv file
    const sheet: FlSheet = FlSpreadsheetFactory.fromArray(this.view.data.table, this.view.title ?? 'Sheet 1');

    sheet.totalColumnsCount = this.view.data.total_number_of_columns;
    sheet.totalRowsCount = this.view.data.total_number_of_rows;
    sheet.columns = new FlSheetHeaders(this.view.data.columns);
    sheet.rows = new FlSheetHeaders(this.view.data.rows);
    spreadSheet.addSheet(sheet);

    this.spreadSheet = spreadSheet;
  }

}
