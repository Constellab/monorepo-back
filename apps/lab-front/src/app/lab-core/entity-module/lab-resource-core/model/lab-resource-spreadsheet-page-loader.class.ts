import {FlSpreadsheetPage, FlSpreadsheetPageLoader} from '@monorepo/front-core-lib';
import {Observable} from 'rxjs';
import {LabResourceTableService} from '../../../entity-service/lab-resource-table.service';
import {RvResourceViewTable, RvViewConfig} from '@monorepo/resource-view';
import {map} from 'rxjs/operators';

/**
 * Class to make request to lab api when loading a spreadsheet page
 */
export class LabResourceSpreadsheetPageLoader implements FlSpreadsheetPageLoader {

  constructor(private resourceTableService: LabResourceTableService,
              private resourceId: string,
              private viewConfig: RvViewConfig) {
  }


  loadRows(fromRow: number): Observable<FlSpreadsheetPage> {
    return this.resourceTableService.callNextPage(this.resourceId,
      this.viewConfig.methodName, this.viewConfig.configValues, this.viewConfig.transformers,
      fromRow)
      .pipe(map(
        view => this.convertToFlSpreadPaginationResult(view)
      ));
  }

  loadPreviousRows(toRow: number): Observable<FlSpreadsheetPage> {
    return this.resourceTableService.callPreviousPage(this.resourceId,
      this.viewConfig.methodName, this.viewConfig.configValues, this.viewConfig.transformers,
      toRow)
      .pipe(map(
        view => this.convertToFlSpreadPaginationResult(view)
      ));
  }

  private convertToFlSpreadPaginationResult(tableView: RvResourceViewTable): FlSpreadsheetPage {
    return {
      data: tableView.data.table,
      rows: tableView.data.rows
    };

  }

}
