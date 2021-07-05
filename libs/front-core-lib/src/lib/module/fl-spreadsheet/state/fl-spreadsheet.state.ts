import {Injectable, OnDestroy} from '@angular/core';
import {FlSpreadsheet} from '../model/fl-spreadsheet.class';
import {FlSheet} from '../model/fl-sheet.class';

/**
 * Unique state shared across the spreadsheet to store the current spreadsheet
 */
@Injectable()
export class FlSpreadsheetState implements OnDestroy {

  private spreadsheet: FlSpreadsheet;

  public init(spreadsheet: FlSpreadsheet): void {
    this.spreadsheet = spreadsheet;
  }

  public get currentSheet(): FlSheet {
    return this.spreadsheet.currentSheet;
  }

  public getSheet(id: number): FlSheet {
    return this.spreadsheet.getSheet(id);
  }

  ngOnDestroy(): void {
    this.spreadsheet.destroy();
  }


}
