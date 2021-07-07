import {Injectable, OnDestroy} from '@angular/core';
import {FlSpreadsheet} from '../model/fl-spreadsheet.class';
import {FlSheet} from '../model/fl-sheet.class';
import {Observable} from 'rxjs';
import {mergeMap} from 'rxjs/operators';

/**
 * Unique state shared across the spreadsheet to store the current spreadsheet
 */
@Injectable()
export class FlSpreadsheetState implements OnDestroy {

  private _spreadsheet: FlSpreadsheet;

  public init(spreadsheet: FlSpreadsheet): void {
    this._spreadsheet = spreadsheet;
  }

  public get spreadsheet(): FlSpreadsheet {
    return this._spreadsheet;
  }


  public getSheet(id: number): FlSheet {
    return this._spreadsheet.getSheet(id);
  }

  //////////////////////////////////////// CURRENT SHEET /////////////////////////
  public get currentSheet(): FlSheet {
    return this._spreadsheet.currentSheet;
  }

  public get currentSheet$(): Observable<FlSheet> {
    return this._spreadsheet.getCurrentSheet$();
  }

  // emit the columns count
  // each time the current sheet change or the columns of current sheet change
  // it's working well thanks to the behaviour subjects
  public getCurrentSheetColumnsCount(): Observable<number> {
    return this.currentSheet$.pipe(
      mergeMap(sheet => sheet.getColumnsCount$())
    );
  }

  // emit the rows count
  // each time the current sheet change or the rows of current sheet change
  // it's working well thanks to the behaviour subjects
  public getCurrentSheetRowsCount(): Observable<number> {
    return this.currentSheet$.pipe(
      mergeMap(sheet => sheet.getRowsCount$())
    );
  }


  ngOnDestroy(): void {
    this._spreadsheet.destroy();
  }


}
