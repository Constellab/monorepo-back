import {ElementRef, Injectable, NgZone, OnDestroy, Renderer2} from '@angular/core';
import {FlSpreadsheetSelectionState} from './fl-spreadsheet-selection.state';
import {FlSpreadsheetState} from './fl-spreadsheet.state';
import {columnIdAttributeName, FlCell, headerIndexAttributeName, headerTypeAttributeName, rowIdAttributeName} from '../model/fl-cell.class';
import {FlCellCoord, FlHeaderCellType, FlSheetSingleSelection} from '../model/selection/fl-sheet-single-selection.class';
import {FlSpreadsheetContextMenu} from './fl-spreadsheet-context-menu.state';
import {FlMouseButton} from '../../../utils/fl-keyboard.helper';

type MouseEventCell = Cell | HeaderCell;

interface Cell {
  type: 'cell';
  coord: FlCellCoord;
  cell: FlCell;
}

interface HeaderCell {
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

  constructor(private state: FlSpreadsheetState,
              private selectionState: FlSpreadsheetSelectionState,
              private contextMenuState: FlSpreadsheetContextMenu,
              private renderer: Renderer2, private elementRef: ElementRef,
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
    const cellEvent: MouseEventCell = this.getCellFromMouseEventTarget(event);

    if (cellEvent == null) {
      return;
    }

    this.expandSelection(cellEvent);
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

  // expand the current selection base on cellEvent
  private expandSelection(cellEvent: MouseEventCell): void {
    if (cellEvent.type === 'cell') {
      this.selectionState.expandSelection(cellEvent.coord);
    } else {
      if (cellEvent.headerType === 'row') {
        this.selectionState.expandRowsSelection(cellEvent.index);
      } else {
        this.selectionState.expandColumnsSelection(cellEvent.index);
      }
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
        return this.getCellFromTarget(target);
      } else if (target.tagName === 'FL-SPREADSHEET-HEADER-CELL') {
        return this.getHeaderCellFromTarget(target);
      }
    }

    return null;
  }

  // returns cell based on a target element : FL-SPREADSHEET-CELL
  private getCellFromTarget(element: Element): Cell {
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

  // returns header cell info based on a target element : FL-SPREADSHEET-HEADER-CELL
  private getHeaderCellFromTarget(element: Element): HeaderCell {
    const index: number = parseInt(element.getAttribute(headerIndexAttributeName));
    const type: FlHeaderCellType = element.getAttribute(headerTypeAttributeName) as FlHeaderCellType;

    return {
      type: 'header',
      headerType: type,
      index: index
    };
  }

  private clearMouseMoveListener(): void {
    if (this.mouseMoveListener) {
      this.mouseMoveListener();
      this.mouseMoveListener = null;
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
