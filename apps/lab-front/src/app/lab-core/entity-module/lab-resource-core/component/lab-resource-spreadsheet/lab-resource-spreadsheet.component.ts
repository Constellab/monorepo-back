import {Component, Input, OnInit} from '@angular/core';
import {FlSheetChartService, FlSpreadsheet} from '@monorepo/front-core-lib';
import {LabResourceTableChartService} from '../../state/lab-resource-table-chart.service';
import {RvResourceViewDirective, RvResourceViewTable, rvTableToSpreadsheet} from '@monorepo/resource-view';

/**
 * Component to display a resource in a spreadsheet
 */
@Component({
  selector: 'lab-resource-spreadsheet',
  templateUrl: './lab-resource-spreadsheet.component.html',
  styleUrls: ['./lab-resource-spreadsheet.component.scss'],
  providers: [
    LabResourceTableChartService,
  ]
})
export class LabResourceSpreadsheetComponent extends RvResourceViewDirective<RvResourceViewTable> implements OnInit {

  @Input() view: RvResourceViewTable;

  spreadSheet: FlSpreadsheet;

  chartService: FlSheetChartService;

  constructor(private tableChartService: LabResourceTableChartService) {
    super();
  }

  ngOnInit(): void {
    // init the chart state so it knows the context
    this.tableChartService.init(this.resourceId,
      this.config.methodName,
      this.config.configValues,
      this.config.transformers);
    this.chartService = this.tableChartService;

    this.spreadSheet = rvTableToSpreadsheet(this.view);
  }

}
