import {ElementRef, Injectable, NgZone, OnDestroy, Renderer2} from '@angular/core';
import {FlSpreadsheetSelectionState} from './fl-spreadsheet-selection.state';
import {FlSpreadsheetState} from './fl-spreadsheet.state';
import {FlSheetSingleSelection} from '../model/selection/fl-sheet-single-selection.class';
import {FlSpreadsheetContextMenu} from './fl-spreadsheet-context-menu.state';
import {FlMouseButton} from '../../../utils/fl-keyboard.helper';
import {FlSpreadsheetScrollState} from './fl-spreadsheet-scroll.state';
import {FlCellCoord} from '../model/fl-cell-coord.class';
import {FlCoord} from '../../../model/shared/fl-coord.class';
import {FlSheetMouseEventCell, FlSpreadsheetElementState} from './fl-spreadsheet-element.state';


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
  private readonly expandAutoScrollZoneWidth: number = 100;
  private expandSelectionScrollInterval: any;
  private expandSelectionScrollIntervalDuration: number = 100;

  private lastMousePosition: FlCoord;

  constructor(private state: FlSpreadsheetState,
              private elementState: FlSpreadsheetElementState,
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
    // on listen to left-click
    if (event.button !== FlMouseButton.LEFT) {
      return;
    }

    const cellEvent: FlSheetMouseEventCell = this.elementState.getCellFromHTMLElement(event.target as any);

    // if the cell couldn't be found
    if (cellEvent == null) {
      return;
    }

    // if this is the first cell (on top left)
    if (cellEvent.type === 'header' && cellEvent.index === -1) {
      this.selectionState.selectAllColumns();
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

    this.expandSelectionScrollInterval = setInterval(() => this.onMouseInterval(),
      this.expandSelectionScrollIntervalDuration);
  }

  private onMouseMove(event: MouseEvent): void {
    // save the last mouse position
    this.lastMousePosition = {
      x: event.clientX,
      y: event.clientY
    };

    // retrieve the cell form the mouse event to expand the selection
    const cellEvent: FlSheetMouseEventCell = this.elementState.getCellFromHTMLElement(event.target as any);
    if (cellEvent == null) {
      return;
    }

    // if the mouse is in the scroll zone, we lock the row selection because it is automatically done by the scroll zone
    const shift: number = this.getYScrollZoneFromMousePosition(event.clientY);
    const lockRow = shift !== 0;
    this.expandSelection(cellEvent, lockRow);
  }

  private onMouseInterval(): void {
    if (!this.lastMousePosition) return;

    const xShift: number = this.getXScrollZoneFromMousePosition(this.lastMousePosition.x);
    const yShift: number = this.getYScrollZoneFromMousePosition(this.lastMousePosition.y);

    this.selectionState.expandSelectionWithShift(yShift, xShift);
  }


  // reset the selection
  private selectUnique(cellEvent: FlSheetMouseEventCell): void {
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
   * @param lockColumn if true, the column is not changed
   * @private
   */
  private expandSelection(cellEvent: FlSheetMouseEventCell, lockRow: boolean = false, lockColumn: boolean = false): void {
    const currentSelection: FlSheetSingleSelection = this.selectionState.currentSelection;

    if (currentSelection == null) return;

    const coord: FlCellCoord = this.mouseEventCellToCoord(cellEvent, currentSelection);

    // prevent row change if set
    if (lockRow) {
      coord.row = currentSelection.endRow;
    }

    // prevent column change if set
    if (lockColumn) {
      coord.column = currentSelection.endColumn;
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
  private mouseEventCellToCoord(cellEvent: FlSheetMouseEventCell, currentSelection: FlSheetSingleSelection): FlCellCoord {
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
    if (this.readOnly) return;
    const cellEvent: FlSheetMouseEventCell = this.elementState.getCellFromHTMLElement(event.target as any);

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
    const cellEvent: FlSheetMouseEventCell = this.elementState.getCellFromHTMLElement(event.target as any);

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
  private getYScrollZoneFromMousePosition(y: number): number {
    const rect: DOMRect = this.elementRef.nativeElement.getBoundingClientRect();
    const relativePosition: number = y - rect.top;
    if (relativePosition < this.expandAutoScrollZoneHeight) {
      return -1;
    } else if (relativePosition > (rect.height - this.expandAutoScrollZoneHeight)) {
      return 1;
    } else {
      return 0;
    }
  }

  // return -1 if the mouse event is in the upper scroll zone
  // 1 if the mouse event is in the lower scroll zone
  // 0 if the mouse event is not in the scroll zone
  private getXScrollZoneFromMousePosition(x: number): number {
    const rect: DOMRect = this.elementRef.nativeElement.getBoundingClientRect();
    const relativePosition: number = x - rect.left;
    if (relativePosition < this.expandAutoScrollZoneWidth) {
      return -1;
    } else if (relativePosition > (rect.width - this.expandAutoScrollZoneWidth)) {
      return 1;
    } else {
      return 0;
    }
  }

  private get readOnly(): boolean {
    return this.state.readOnly;
  }

  ngOnDestroy(): void {
    this.mouseDownListener();
    this.mouseUpListener();
    this.dblClickListener();
    this.contextMenuListener();
    this.clearMouseMoveListener();
  }


}
