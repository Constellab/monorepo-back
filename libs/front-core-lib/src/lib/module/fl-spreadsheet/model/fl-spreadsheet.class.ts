import {BehaviorSubject, Observable} from 'rxjs';
import {FlSheet} from './fl-sheet.class';

export class FlSpreadsheet {

  private readonly sheets: FlSheet[] =  [];
  private currentSheet$: BehaviorSubject<FlSheet> = new BehaviorSubject<FlSheet>(null);

  constructor(defaultSheetName: string) {
    this.sheets = [];
    this.addSheet(defaultSheetName);
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
