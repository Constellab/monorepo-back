import {ElementRef, Injectable, NgZone, OnDestroy, Renderer2} from '@angular/core';
import {FlSpreadsheetSelectionState} from './fl-spreadsheet-selection.state';
import {FlSpreadsheetState} from './fl-spreadsheet.state';
import {columnIdAttributeName, FlCell, headerIndexAttributeName, headerTypeAttributeName, rowIdAttributeName} from '../model/fl-cell.class';
import {FlCellCoord, FlHeaderCellType, FlSheetSingleSelection} from '../model/selection/fl-sheet-single-selection.class';
import {FlSpreadsheetContextMenu} from './fl-spreadsheet-context-menu.state';
import {FlMouseButton} from '../../../utils/fl-keyboard.helper';
import {FlSpreadsheetScrollState} from './fl-spreadsheet-scroll.state';

type MouseEventCell = CellEvent | HeaderCellEvent;

interface CellEvent {
  type: 'cell';
  coord: FlCellCoord;
  cell: FlCell;
}

interface HeaderCellEvent {
  type: 'header';
  headerType: FlHeaderCellType;
  index: number;
}

/**
 * Unique state shared across the spreadsheet to handle spreadsheet mouse events
 */
@Injectable()
export class FlSpreadsheetMouseManagerState implements OnDestroy {

  private mouseDownListener: () => void;
  private mouseMoveListener: () => void;
  private mouseUpListener: () => void;
  private dblClickListener: () => void;
  private contextMenuListener: () => void;

  private readonly expandAutoScrollZoneHeight: number = 24;
  private expandSelectionScrollInterval: any;
  private expandSelectionScrollIntervalDuration: number = 100;

  constructor(private state: FlSpreadsheetState,
              private selectionState: FlSpreadsheetSelectionState,
              private contextMenuState: FlSpreadsheetContextMenu,
              private scrollState: FlSpreadsheetScrollState,
              private renderer: Renderer2, private elementRef: ElementRef<HTMLElement>,
              private ngZone: NgZone) {
  }

  public init(): void {
    if (this.mouseDownListener != null) {
      console.error('The init method must be called only once');
      return;
    }

    // run event listener outside angular zone to prevent automatic change detection
    this.ngZone.runOutsideAngular(() => {
      this.mouseDownListener = this.renderer.listen(this.elementRef.nativeElement, 'mousedown',
        (event: MouseEvent) => this.onMouseDown(event));

      this.mouseUpListener = this.renderer.listen(this.elementRef.nativeElement, 'mouseup',
        () => this.onMouseUp());

      this.dblClickListener = this.renderer.listen(this.elementRef.nativeElement, 'dblclick',
        (event: MouseEvent) => this.onMouseDblClick(event));
    });

    this.contextMenuListener = this.renderer.listen(this.elementRef.nativeElement, 'contextmenu',
      (event: MouseEvent) => this.onContextMenu(event));
  }


  private onMouseDown(event: MouseEvent): void {
    // on listen to left click
    if (event.button !== FlMouseButton.LEFT) {
      return;
    }

    const cellEvent: MouseEventCell = this.getCellFromMouseEventTarget(event);

    if (cellEvent == null) {
      return;
    }

    if (event.shiftKey && this.selectionState.hasSelection()) {
      this.expandSelection(cellEvent);
    } else {
      this.selectUnique(cellEvent);
    }

    this.clearMouseMoveListener();
    this.mouseMoveListener = this.renderer.listen(this.elementRef.nativeElement, 'mousemove',
      (event: MouseEvent) => this.onMouseMove(event));
  }

  private onMouseMove(event: MouseEvent): void {

    const shift: number = this.getScrollZoneFromMouseEvent(event);

    // if we are in the scroll zone
    if (shift !== 0) {

      // if an interval is already running, do nothing the interval will trigger the scroll
      if (!this.expandSelectionScrollInterval) {

        // create an interval to trigger a scroll each x ms (while the user's mouse in the the scroll zone)
        this.expandSelectionScrollInterval = setInterval(() => {
          this.selectionState.expandSelectionWithShift(shift, 0);
        }, this.expandSelectionScrollIntervalDuration);
      }

    } else {
      // use to clear the interval is the mouse left the scrolling zone
      this.clearMouseMoveInterval();
    }

    // retrieve the cell form the mouse event to expand the selection
    const cellEvent: MouseEventCell = this.getCellFromMouseEventTarget(event);
    if (cellEvent == null) {
      return;
    }

    // if the mouse is in the scroll zone, we lock the row selection because it is automatically done by the scroll zone
    const lockRow = shift !== 0;
    this.expandSelection(cellEvent, lockRow);
  }


  // reset the selection
  private selectUnique(cellEvent: MouseEventCell): void {
    if (cellEvent.type === 'cell') {
      this.selectionState.selectUniqueCell(cellEvent.coord);
    } else {
      if (cellEvent.headerType === 'row') {
        this.selectionState.selectUniqueRow(cellEvent.index);
      } else {
        this.selectionState.selectUniqueColumn(cellEvent.index);
      }
    }
  }

  /**
   * expand the current selection base on cellEvent
   * @param cellEvent
   * @param lockRow if true, the row is not changed
   * @private
   */
  private expandSelection(cellEvent: MouseEventCell, lockRow: boolean = false): void {
    const currentSelection: FlSheetSingleSelection = this.selectionState.currentSelection;

    if (currentSelection == null) return;

    const coord: FlCellCoord = this.mouseEventCellToCoord(cellEvent, currentSelection);

    // prevent row change if set
    if(lockRow){
      coord.row = currentSelection.endRow;
    }

    switch (currentSelection.type) {
      case 'rows':
        this.selectionState.expandRowsSelection(coord.row);
        break;
      case 'columns':
        this.selectionState.expandColumnsSelection(coord.column);
        break;
      default:
        this.selectionState.expandSelection(coord);
        break;
    }
  }

  // retrieve cell cord from MouseEventCell and current selection
  private mouseEventCellToCoord(cellEvent: MouseEventCell, currentSelection: FlSheetSingleSelection): FlCellCoord {
    if (cellEvent.type === 'cell') {
      return cellEvent.coord;
    }

    if (cellEvent.headerType === 'row') {
      return {
        row: cellEvent.index,
        column: currentSelection.endColumn // use the last column selection to prevent changing column when hovering a row
      };
    } else {
      return {
        row: currentSelection.endRow, // use the last row selection to prevent changing row when hovering a column
        column: cellEvent.index
      };
    }
  }

  private onMouseDblClick(event: MouseEvent): void {
    const cellEvent: MouseEventCell = this.getCellFromMouseEventTarget(event);

    if (cellEvent == null) {
      return;
    }

    if (cellEvent.type === 'cell') {
      cellEvent.cell.setEdit(true);
    }
  }

  private onMouseUp(): void {
    this.clearMouseMoveListener();
  }

  private onContextMenu(event: MouseEvent): void {
    const cellEvent: MouseEventCell = this.getCellFromMouseEventTarget(event);

    if (cellEvent == null) {
      return;
    }

    event.preventDefault();

    const selection: FlSheetSingleSelection = this.selectionState.currentSelection;

    if (cellEvent.type === 'header') {
      if (cellEvent.headerType === 'row') {
        this.contextMenuState.openHeaderRowContextMenu(event);

        // if the clicked row is not within selection
        if (!selection || selection.type !== 'rows' || !selection.rowIsSelected(cellEvent.index)) {
          this.selectionState.selectUniqueRow(cellEvent.index);
        }
      } else {
        this.contextMenuState.openHeaderColumnContextMenu(event);

        // if the clicked column is not within selection
        if (!selection || selection.type !== 'columns' || !selection.columnIsSelected(cellEvent.index)) {
          this.selectionState.selectUniqueColumn(cellEvent.index);
        }
      }
    } else {
      this.contextMenuState.openCellContextMenu(event);
      // if clicked cell is not in the current selection, select the cell
      if (!selection || !selection.coordIsSelected(cellEvent.coord)) {
        this.selectionState.selectUniqueCell(cellEvent.coord);
      }
    }
  }


  private getCellFromMouseEventTarget(event: MouseEvent): MouseEventCell | null {
    const targets: Element[] = event.composedPath() as any;

    for (const target of targets) {
      if (target.tagName === 'TABLE') {
        break;
      }

      if (target.tagName === 'FL-SPREADSHEET-CELL') {
        return this.getCellFromHTMLElement(target);
      } else if (target.tagName === 'FL-SPREADSHEET-HEADER-CELL') {
        return this.getHeaderCellFromHTMLElement(target);
      }
    }

    return null;
  }

  // returns cell based on a html element : FL-SPREADSHEET-CELL
  private getCellFromHTMLElement(element: Element): CellEvent {
    const row: number = parseInt(element.getAttribute(rowIdAttributeName));
    const column: number = parseInt(element.getAttribute(columnIdAttributeName));

    return {
      type: 'cell',
      cell: this.state.currentSheet.getCell(row, column),
      coord: {
        row: row,
        column: column
      }
    };
  }

  // returns header cell info based on a html element : FL-SPREADSHEET-HEADER-CELL
  private getHeaderCellFromHTMLElement(element: Element): HeaderCellEvent {
    const index: number = parseInt(element.getAttribute(headerIndexAttributeName));
    const type: FlHeaderCellType = element.getAttribute(headerTypeAttributeName) as FlHeaderCellType;

    return {
      type: 'header',
      headerType: type,
      index: index,
    };
  }

  private clearMouseMoveListener(): void {
    if (this.mouseMoveListener) {
      this.mouseMoveListener();
      this.mouseMoveListener = null;
    }
    this.clearMouseMoveInterval();
  }

  private clearMouseMoveInterval(): void {
    if (this.expandSelectionScrollInterval) {
      clearInterval(this.expandSelectionScrollInterval);
      this.expandSelectionScrollInterval = null;
    }
  }


  // return -1 if the mouse event is in the upper scroll zone
  // 1 if the mouse event is in the lower scroll zone
  // 0 if the mouse event is not in the scroll zone
  private getScrollZoneFromMouseEvent(mouseEvent: MouseEvent): number {
    const rect: DOMRect = this.elementRef.nativeElement.getBoundingClientRect();
    const relativePosition: number = mouseEvent.clientY - rect.top;
    if (relativePosition < this.expandAutoScrollZoneHeight) {
      return -1;
    } else if (relativePosition > (rect.height - this.expandAutoScrollZoneHeight)) {
      return 1;
    } else {
      return 0;
    }
  }

  ngOnDestroy(): void {
    this.mouseDownListener();
    this.mouseUpListener();
    this.dblClickListener();
    this.contextMenuListener();
    this.clearMouseMoveListener();
  }


}
