import {BehaviorSubject, Observable} from 'rxjs';
import {FlSheet} from './fl-sheet.class';

export class FlSpreadsheet {

  private readonly sheets: FlSheet[] = [];
  private currentSheet$: BehaviorSubject<FlSheet> = new BehaviorSubject<FlSheet>(null);

  constructor(defaultSheetName: string) {
    this.sheets = [];
    this.addSheet(defaultSheetName);
  }

  /**
   * Create a spreadsheet with a single sheet, initiated with the values
   * @param values
   * @param defaultSheetName
   */
  public static fromArray(values: any[][], defaultSheetName: string): FlSpreadsheet {
    const spreadSheet: FlSpreadsheet = new FlSpreadsheet(defaultSheetName);
    const sheet: FlSheet = spreadSheet.currentSheet;

    // get the maximum number of columns from the values
    const maxColumnsLength: number = values.reduce((m, x) => m.length > x.length ? m : x, []).length;

    // create the columns
    sheet.appendMultipleColumns(maxColumnsLength);

    // create the rows and set value
    sheet.appendMultipleRows(values.length);

    // set the cell values
    sheet.setValuesFromCoord(values, {row: 0, column: 0});

    return spreadSheet;
  }


  ///////////////////////////// SHEET //////////////////////////////
  get currentSheet(): FlSheet {
    return this.currentSheet$.value;
  }

  getCurrentSheet$(): Observable<FlSheet> {
    return this.currentSheet$.asObservable();
  }

  public addSheet(name: string): FlSheet {
    const sheet: FlSheet = new FlSheet(name);
    this.sheets.push(sheet);
    this.selectSheet(sheet.id);
    return sheet;
  }

  private selectSheet(id: number): void {
    const sheet: FlSheet = this.getSheet(id);
    this.currentSheet$.next(sheet);
  }

  public getSheet(id: number): FlSheet {
    return this.sheets.find(sheet => sheet.id === id);
  }
}
