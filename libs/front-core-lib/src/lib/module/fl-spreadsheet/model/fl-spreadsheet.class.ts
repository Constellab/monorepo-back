import {BehaviorSubject, Observable} from 'rxjs';
import {FlSheet} from './fl-sheet.class';

export class FlSpreadsheet {

  private readonly sheets$: BehaviorSubject<FlSheet[]> = new BehaviorSubject([]);
  private readonly currentSheet$: BehaviorSubject<FlSheet> = new BehaviorSubject(null);

  constructor() {
  }

  ///////////////////////////// SHEET //////////////////////////////
  public get currentSheet(): FlSheet {
    return this.currentSheet$.value;
  }

  public getCurrentSheet$(): Observable<FlSheet> {
    return this.currentSheet$.asObservable();
  }

  public getSheets$(): Observable<FlSheet[]> {
    return this.sheets$.asObservable();
  }

  public addSheet(sheet: FlSheet): FlSheet {
    // add the sheet
    const sheets: FlSheet[] = this.sheets;
    sheets.push(sheet);
    this.sheets$.next(sheets);

    // select the sheet
    this.selectSheet(sheet.id);
    return sheet;
  }

  public selectSheet(id: number): void {
    if (id === this.currentSheet?.id) return;
    const sheet: FlSheet = this.getSheet(id);

    if (sheet) {
      this.currentSheet$.next(sheet);
    }
  }

  public getSheet(id: number): FlSheet {
    return this.sheets.find(sheet => sheet.id === id);
  }

  public get sheets(): FlSheet[] {
    return this.sheets$.value;
  }


  public destroy(): void {
    this.sheets$.complete();
    this.currentSheet$.complete();
    this.sheets.forEach(sheet => sheet.destroy());
  }
}
