import {Injectable} from '@angular/core';
import {FlSheet, FlSpreadsheet} from '@monorepo/front-core-lib';

/**
 * Unique state shared across the spreadsheet to store the current spreadsheet
 */
@Injectable()
export class FlSpreadsheetState {

  private spreadsheet: FlSpreadsheet;

  public init(spreadsheet: FlSpreadsheet): void {
    this.spreadsheet = spreadsheet;
  }

  public get currentSheet(): FlSheet {
    return this.spreadsheet.currentSheet;
  }
}
