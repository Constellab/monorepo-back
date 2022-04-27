import {Injectable, OnDestroy} from '@angular/core';
import {FlSpreadsheet} from '../model/fl-spreadsheet.class';
import {FlSheet} from '../model/fl-sheet.class';
import {Observable} from 'rxjs';
import {mergeMap} from 'rxjs/operators';
import {FlSpreadsheetFactory} from '../utils/fl-spreadsheet.factory';
import {FlCell} from '../model/fl-cell.class';
import {FlSheetHeader, FlSheetRow} from '../model/fl-sheet-headers.class';
import {FlSheetChartService} from '../model/chart/fl-sheet-chart.service';

/**
 * Unique state shared across the spreadsheet to store the current spreadsheet
 */
@Injectable()
export class FlSpreadsheetState implements OnDestroy {

  private _spreadsheet: FlSpreadsheet;

  private lastSheetId: number = 0;

  // list of sheet of cell objects
  private cellObjectSheets: Map<number, FlSheet> = new Map();

  public readOnly: boolean = false;

  private chartService: FlSheetChartService;

  public init(spreadsheet: FlSpreadsheet, readOnly: boolean, chartService: FlSheetChartService): void {
    this._spreadsheet = spreadsheet;
    this.lastSheetId = spreadsheet.sheets.length;
    this.readOnly = readOnly;
    this.chartService = chartService;
  }

  public get spreadsheet(): FlSpreadsheet {
    return this._spreadsheet;
  }


  public getSheet(id: number): FlSheet {
    return this._spreadsheet.getSheet(id);
  }


  ///////////////////////// CURRENT SHEET /////////////////////////
  public get currentSheet(): FlSheet {
    return this._spreadsheet.currentSheet;
  }

  public get currentSheet$(): Observable<FlSheet> {
    return this._spreadsheet.getCurrentSheet$();
  }

  // emit the columns
  // each time the current sheet change or the columns of current sheet change
  // it's working well thanks to the behaviour subjects
  public getCurrentSheetColumns$(): Observable<FlSheetHeader[]> {
    return this.currentSheet$.pipe(
      mergeMap(sheet => sheet.getColumns$())
    );
  }

  // emit the rows
  // each time the current sheet change or the rows of current sheet change
  // it's working well thanks to the behaviour subjects
  public getCurrentSheetRows$(): Observable<FlSheetRow[]> {
    return this.currentSheet$.pipe(
      mergeMap(sheet => sheet.getRows$())
    );
  }

  /**
   * For cell object, this open the cell value in a new sheet
   */
  public openCellInNewSheet(cell: FlCell): void {
    // check if the sheet for this cell already exists
    const sheet: FlSheet = this.cellObjectSheets.get(cell.id);
    if (sheet != null) {
      this._spreadsheet.selectSheet(sheet.id);
      return;
    }

    // if this is a new sheet
    const sheetName: string = FlSpreadsheetFactory.getSheetNameFromId(++this.lastSheetId);
    const newSheet = FlSpreadsheetFactory.fromAny(cell.value, sheetName);
    this.cellObjectSheets.set(cell.id, newSheet);
    this._spreadsheet.addSheet(newSheet);
  }


  //////////////////////////////////// OTHER ////////////////////////////////////
  public getChartService(): FlSheetChartService {
    return this.chartService;
  }


  ngOnDestroy(): void {
    this._spreadsheet.destroy();
  }


}
