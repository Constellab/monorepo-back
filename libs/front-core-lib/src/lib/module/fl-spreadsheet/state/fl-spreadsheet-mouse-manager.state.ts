import {ElementRef, Injectable, NgZone, OnDestroy, Renderer2} from '@angular/core';
import {FlSpreadsheetSelectionState} from './fl-spreadsheet-selection.state';
import {FlSpreadsheetState} from './fl-spreadsheet.state';
import {columnIdAttributeName, rowIdAttributeName} from '../model/fl-cell.class';
import {FlCellWithCoord} from '../model/fl-sheet-selection.class';


/**
 * Unique state shared across the spreadsheet to handle spreadsheet mouse events
 */
@Injectable()
export class FlSpreadsheetMouseManagerState implements OnDestroy {

  private mouseDownListener: () => void;
  private mouseMoveListener: () => void;
  private mouseUpListener: () => void;
  private dblClickListener: () => void;

  constructor(private state: FlSpreadsheetState,
              private selectionState: FlSpreadsheetSelectionState,
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
  }

  private onMouseDown(event: MouseEvent): void {
    const cell: FlCellWithCoord = this.getCellFromMouseEventTarget(event);

    if (cell != null) {
      this.selectionState.selectUniqueCell(cell);

      this.clearMouseMoveListener();
      this.mouseMoveListener = this.renderer.listen(this.elementRef.nativeElement, 'mousemove',
        (event: MouseEvent) => this.onMouseMove(event));
    }
  }

  private onMouseMove(event: MouseEvent): void {
    const cell: FlCellWithCoord = this.getCellFromMouseEventTarget(event);
    if (cell) {
      this.selectionState.expandSelection(cell.coord);
    }
  }

  private onMouseDblClick(event: MouseEvent): void {
    const cell: FlCellWithCoord = this.getCellFromMouseEventTarget(event);
    if (cell) {
      cell.cell.setEdit(true);
    }
  }

  private onMouseUp(): void {
    this.selectionState.endSelection();
    this.clearMouseMoveListener();
  }


  private getCellFromMouseEventTarget(event: MouseEvent): FlCellWithCoord | null {
    const targets: Element[] = event.composedPath() as any;

    let element: Element;
    for (const target of targets) {
      if (target.tagName === 'TABLE') {
        break;
      }

      if (target.tagName === 'FL-SPREADSHEET-CELL') {
        element = target;
        break;
      }
    }
    if (element == null) {
      return null;
    }


    const row: number = parseInt(element.getAttribute(rowIdAttributeName));
    const column: number = parseInt(element.getAttribute(columnIdAttributeName));

    return {
      cell: this.state.currentSheet.getCell(row, column),
      coord: {
        row: row,
        column: column
      }
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
    this.mouseMoveListener();
    this.dblClickListener();
    this.clearMouseMoveListener();
  }


}
