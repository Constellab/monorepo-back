import {Component, Input, OnInit} from '@angular/core';
import {FlPortalService, FlSheetChartConfig, FlSpreadsheet} from '@monorepo/front-core-lib';
import {RvResourceViewDirective, RvResourceViewTable, rvTableToSpreadsheet} from '@monorepo/resource-view';
import {
  LabTableChartConfigBarPlot,
  LabTableChartConfigBoxPlot,
  LabTableChartConfigHeatMap,
  LabTableChartConfigHistogram,
  LabTableChartConfigLinePlot,
  LabTableChartConfigScatterPlot,
  LabTableChartConfigStackedBarPlot,
  LabTableChartConfigVennDiagram
} from '../../model/lab-table-chart-config.class';
import {LabResourceTableService} from '../../../../entity-service/lab-resource-table.service';
import {LabResourceSpreadsheetPageLoader} from '../../model/lab-resource-spreadsheet-page-loader.class';

/**
 * Component to display a resource in a spreadsheet
 */
@Component({
  selector: 'lab-resource-spreadsheet',
  templateUrl: './lab-resource-spreadsheet.component.html',
  styleUrls: ['./lab-resource-spreadsheet.component.scss']
})
export class LabResourceSpreadsheetComponent extends RvResourceViewDirective<RvResourceViewTable> implements OnInit {

  @Input() view: RvResourceViewTable;

  spreadSheet: FlSpreadsheet;

  chartConfig: FlSheetChartConfig[];

  pagination: LabResourceSpreadsheetPageLoader;

  constructor(private resourceTableService: LabResourceTableService, private portalService: FlPortalService) {
    super();
  }

  ngOnInit(): void {
    // list all available charts
    this.chartConfig = [
      new LabTableChartConfigLinePlot(this.resourceId, this.config.methodName, this.config.configValues, this.config.transformers,
        this.resourceTableService, this.portalService),
      new LabTableChartConfigScatterPlot(this.resourceId, this.config.methodName, this.config.configValues, this.config.transformers,
        this.resourceTableService, this.portalService),
      new LabTableChartConfigBarPlot(this.resourceId, this.config.methodName, this.config.configValues, this.config.transformers,
        this.resourceTableService, this.portalService),
      new LabTableChartConfigStackedBarPlot(this.resourceId, this.config.methodName, this.config.configValues, this.config.transformers,
        this.resourceTableService, this.portalService),
      new LabTableChartConfigHistogram(this.resourceId, this.config.methodName, this.config.configValues, this.config.transformers,
        this.resourceTableService, this.portalService),
      new LabTableChartConfigBoxPlot(this.resourceId, this.config.methodName, this.config.configValues, this.config.transformers,
        this.resourceTableService, this.portalService),
      new LabTableChartConfigHeatMap(this.resourceId, this.config.methodName, this.config.configValues, this.config.transformers,
        this.resourceTableService, this.portalService),
      new LabTableChartConfigVennDiagram(this.resourceId, this.config.methodName, this.config.configValues, this.config.transformers,
        this.resourceTableService, this.portalService),
    ];


    this.spreadSheet = rvTableToSpreadsheet(this.view);

    this.pagination = new LabResourceSpreadsheetPageLoader(this.resourceTableService,
      this.resourceId, this.config);
  }

}
