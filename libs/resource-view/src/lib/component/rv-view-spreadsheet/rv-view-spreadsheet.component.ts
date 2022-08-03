import {Component, Inject, Input, OnInit} from '@angular/core';
import {FlSpreadsheet} from '@monorepo/front-core-lib';
import {RvResourceViewDirective} from '../../model/rv-resource-view.directive';
import {RV_MODULE_CONFIG, RvResourceViewModuleConfig} from '../../model/rv-resource-view-module.config';
import {RvResourceViewTable, rvTableToSpreadsheet} from '../../model/rv-table.class';

/**
 * Component to display a resource in a spreadsheet
 */
@Component({
  selector: 'rv-view-spreadsheet',
  templateUrl: './rv-view-spreadsheet.component.html',
  styleUrls: ['./rv-view-spreadsheet.component.scss'],
})
export class RvViewSpreadsheetComponent extends RvResourceViewDirective<RvResourceViewTable>
  implements OnInit {

  @Input() view: RvResourceViewTable;

  spreadSheet: FlSpreadsheet;

  constructor(@Inject(RV_MODULE_CONFIG) private moduleConfig: RvResourceViewModuleConfig) {
    super();
  }

  ngOnInit(): void {
    // ignore the table offset (fromRow and fromCol) because it doesn't work with local chart
    this.spreadSheet = rvTableToSpreadsheet(this.view, true);
  }

}
