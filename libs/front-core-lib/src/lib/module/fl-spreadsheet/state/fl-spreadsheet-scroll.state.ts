import {ElementRef, Injectable, NgZone, Renderer2} from '@angular/core';
import {FlSpreadsheetState} from './fl-spreadsheet.state';
import {FlSheet} from '../model/fl-sheet.class';
import {BehaviorSubject, Observable, Subject} from 'rxjs';
import {filter} from 'rxjs/operators';
import {FlSheetRow} from '../model/fl-sheet-row.class';
import {clRxjsEnterZone} from '@monorepo/core-lib';

/**
 * State to handle scroll of spreadsheet
 *
 * It is supposed to replace the CDK view port
 * IT is not ready yet
 */
@Injectable()
export class FlSpreadsheetScrollState {

  private rowsToDisplay$: Subject<FlSheetRow[]> = new BehaviorSubject(null);

  // parent of the heightSimulator that scroll
  private tableContainer: HTMLElement;
  private scroller: HTMLElement;
  // html element that is simulate the complete spreadsheet height
  private heightSimulator: HTMLElement;

  // height of a cell in px
  private readonly cellHeight: number = 24;

  private wheelListener: () => void;
  private scrollListener: () => void;

  constructor(private renderer: Renderer2,
              private state: FlSpreadsheetState,
              private ngZone: NgZone) {
  }


  public init(tableContainer: ElementRef<HTMLElement>, scroller: ElementRef<HTMLElement>, heightSimulator: ElementRef<HTMLElement>): void {
    this.tableContainer = tableContainer.nativeElement;
    this.scroller = scroller.nativeElement;
    this.heightSimulator = heightSimulator.nativeElement;
    this.onNewSheet(this.state.currentSheet);
    this.listenToScroll();
  }

  public onNewSheet(sheet: FlSheet): void {
    // define the height of the spreadsheet
    this.renderer.setStyle(this.heightSimulator, 'height',
      (this.cellHeight * sheet.getRowsCount() + 1) + 'px');
  }

  private listenToScroll(): void {
    // clear previous listener if exists
    if (this.scrollListener) {
      this.scrollListener();
    }
    if (this.wheelListener) {
      this.wheelListener();
    }

    this.ngZone.runOutsideAngular(() => {
      this.wheelListener = this.renderer.listen(this.tableContainer, 'wheel',
        (event: WheelEvent) => this.triggerScroll(event.deltaY));
      this.scrollListener = this.renderer.listen(this.scroller, 'scroll',
        () => this.onScroll());
      this.onScroll();
    });
  }

  private triggerScroll(y: number): void {
    this.scroller.scrollTo(0, y + this.scroller.scrollTop);
  }

  private onScroll(): void {
    const scrollerHeight: number = this.scroller.offsetHeight;
    const numberOfCell: number = Math.trunc(scrollerHeight / this.cellHeight) + 1;

    const scrollTop: number = this.scroller.scrollTop;
    const firstCell: number = Math.trunc(scrollTop / this.cellHeight);
    const lastCell: number = firstCell + numberOfCell;

    const sheet: FlSheet = this.state.currentSheet;
    const rows: FlSheetRow[] = sheet.getRows(firstCell, lastCell);

    this.rowsToDisplay$.next(rows);
  }

  public getRowsToDisplay$(): Observable<FlSheetRow[]> {
    return this.rowsToDisplay$.asObservable().pipe(
      filter(cells => cells != null),
      clRxjsEnterZone(this.ngZone)
    );
  }


  public scrollOnePage(direction: 'up' | 'down'): void {
    const factor: number = direction === 'up' ? -1 : 1;

    this.triggerScroll(this.tableContainer.offsetHeight * factor);
  }
}
