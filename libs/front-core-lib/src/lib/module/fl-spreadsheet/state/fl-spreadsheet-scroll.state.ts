import {ElementRef, Injectable, NgZone, Renderer2} from '@angular/core';
import {FlSpreadsheetState} from './fl-spreadsheet.state';
import {FlSheet} from '../model/fl-sheet.class';
import {BehaviorSubject, combineLatest, Observable} from 'rxjs';
import {debounceTime, filter, startWith} from 'rxjs/operators';
import {FlSheetRow} from '../model/fl-sheet-row.class';
import {clRxjsEnterZone, ClSubscriptionHandler} from '@monorepo/core-lib';
import {FlRendererListenerObs} from '../../../model/fl-renderer-listener-obs.class';
import {FlSpreadsheetSelectionState} from './fl-spreadsheet-selection.state';

export interface Interval {
  from: number;
  to: number;
}

/**
 * State to handle scroll of spreadsheet
 *
 * It is supposed to replace the CDK view port
 * IT is not ready yet
 */
@Injectable()
export class FlSpreadsheetScrollState {

  private rowsToDisplay$: BehaviorSubject<FlSheetRow[]> = new BehaviorSubject(null);

  // parent of the heightSimulator that scroll
  private tableContainer: HTMLElement;
  private scroller: HTMLElement;
  // html element that is simulate the complete spreadsheet height
  private heightSimulator: HTMLElement;

  // height of a cell in px
  private readonly cellHeight: number = 24;

  private wheelListener: () => void;
  // private wheelListener: () => void;
  private scrollListener: FlRendererListenerObs;
  private windowsResizeListener: FlRendererListenerObs;

  private subscriptions: ClSubscriptionHandler = new ClSubscriptionHandler();

  constructor(private renderer: Renderer2,
              private state: FlSpreadsheetState,
              private ngZone: NgZone,
              private selectionState: FlSpreadsheetSelectionState) {
  }


  public init(tableContainer: ElementRef<HTMLElement>, scroller: ElementRef<HTMLElement>, heightSimulator: ElementRef<HTMLElement>): void {
    this.tableContainer = tableContainer.nativeElement;
    this.scroller = scroller.nativeElement;
    this.heightSimulator = heightSimulator.nativeElement;
    this.listenToScroll();

    // listen to the selection event to scroll to last selection rows if not visible
    this.selectionState.getSelection$()
      // don't scroll on empty, rows or columns selection
      .pipe(filter(selection => selection != null && selection.type !== 'columns'))
      .subscribe(
        selection => this.scrollToRow(selection.endRow)
      );
  }

  private listenToScroll(): void {
    this.clearSubscription();

    this.ngZone.runOutsideAngular(() => {
      // listen to wheel event on spreadsheet to trigger a scroll event on scroller
      this.wheelListener = this.renderer.listen(this.tableContainer, 'wheel',
        (event: WheelEvent) => this.triggerScroll(event.deltaY));

      this.scrollListener = new FlRendererListenerObs(this.renderer, this.scroller, 'scroll');
      this.windowsResizeListener = new FlRendererListenerObs(this.renderer, 'window', 'resize');

      this.subscriptions.add(combineLatest([
        this.state.getCurrentSheetRowsCount(),
        this.scrollListener.onEvent$().pipe(startWith('')),
        this.windowsResizeListener.onEvent$().pipe(startWith(''), debounceTime(100))
      ]).subscribe(
        ([number]) => this.refreshRowsToDisplay(number)
      ));
    });
  }

  private triggerScroll(y: number): void {
    this.scroller.scrollTo(0, y + this.scroller.scrollTop);
  }

  /**
   * Function that recalculate the scroller height and then return the row to display
   * @param totalRowCount
   * @private
   */
  private refreshRowsToDisplay(totalRowCount: number): void {
    // refresh scroller height
    this.recalculateScrollerHeight(totalRowCount);

    // calculate the fist and last row to display
    const scrollerHeight: number = this.scroller.offsetHeight;
    const numberOfCell: number = Math.trunc(scrollerHeight / this.cellHeight);

    const scrollTop: number = this.scroller.scrollTop;
    const firstCell: number = Math.trunc(scrollTop / this.cellHeight);
    // -1 because the number of cell include the first and last cells
    // we are still 1 more cell because of the header cells
    const lastCell: number = firstCell + numberOfCell - 1;

    const sheet: FlSheet = this.state.currentSheet;
    const rows: FlSheetRow[] = sheet.getRows(firstCell, lastCell);

    this.rowsToDisplay$.next(rows);
  }

  /**
   * Reset the size of the height simulator for the scroll
   * @param rowCount
   * @private
   */
  private recalculateScrollerHeight(rowCount: number): void {
    // define the height of the spreadsheet
    // + 1 is to include to header row
    // + 3 is to have little margin the fully display the last row
    this.renderer.setStyle(this.heightSimulator, 'height',
      (this.cellHeight * (rowCount + 1)) + 3 + 'px');
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

  // scroll to the rowId if it's not visible
  public scrollToRow(rowId: number): void {
    // if the rows is already visible
    if (this.rowIsVisible(rowId)) {
      return;
    }

    const interval: Interval = this.getVisibleInterval();
    // if we have to scroll to the top
    if (rowId < interval.from) {
      this.triggerScroll(-this.cellHeight * (interval.from - rowId));
    }
    // if we have to scroll to the bottom
    else {
      this.triggerScroll(this.cellHeight * (rowId - interval.to));
    }

  }

  public rowIsVisible(rowId: number): boolean {
    const interval: Interval = this.getVisibleInterval();

    // if the rows is already visible
    return rowId >= interval.from && rowId <= interval.to;
  }

  // clear the subscription
  private clearSubscription(): void {
    // clear previous listener if exists
    if (this.wheelListener) {
      this.wheelListener();
    }
    this.scrollListener?.complete();
    this.windowsResizeListener?.complete();
    this.subscriptions.unsubscribe();
  }

  public clear(): void {
    this.rowsToDisplay$?.complete();
    this.clearSubscription();
  }

  private get rowsToDisplay(): FlSheetRow[] {
    return this.rowsToDisplay$.value;
  }

  private getVisibleInterval(): Interval {
    const rows: FlSheetRow[] = this.rowsToDisplay;

    return {
      from: rows[0].rowId,
      // we consider the last row as not visible because it is often cut
      // so we do a - 1
      to: rows[rows.length - 1].rowId - 1
    };
  }
}
