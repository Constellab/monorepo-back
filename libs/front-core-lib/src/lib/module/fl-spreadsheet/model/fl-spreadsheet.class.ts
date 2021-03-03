import {BehaviorSubject} from 'rxjs';
import {FlSheet} from './fl-sheet.class';

export class FlSpreadsheet {

  private readonly sheets: FlSheet[];
  private currentSheet$: BehaviorSubject<FlSheet>;

  constructor(sheetName: string) {
    const sheet: FlSheet = new FlSheet(sheetName);
    this.sheets = [sheet];
    this.currentSheet$ = new BehaviorSubject<FlSheet>(sheet);

  }


  ///////////////////////////// SHEET //////////////////////////////
  get currentSheet(): FlSheet {
    return this.currentSheet$.value;
  }
}
