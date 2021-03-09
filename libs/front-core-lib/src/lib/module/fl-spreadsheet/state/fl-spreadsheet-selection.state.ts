import {Injectable, OnDestroy} from '@angular/core';
import {FlCellCoord, FlCellWithCoord, FlSheetSelection, FlSheetSelectionRange} from '../model/fl-sheet-selection-change.class';
import {BehaviorSubject, Observable} from 'rxjs';
import {FlSpreadsheetState} from './fl-spreadsheet.state';
import {FlSheet} from '../model/fl-sheet.class';
import {FlCell} from '../model/fl-cell.class';

/**
 * Unique state shared across the spreadsheet to manage the selection
 */
@Injectable()
export class FlSpreadsheetSelectionState implements OnDestroy {

  private currentSelection$: BehaviorSubject<FlSheetSelection> =
    new BehaviorSubject<FlSheetSelection>(null);

  private _isSelecting: boolean = false;

  constructor(private spreadsheetState: FlSpreadsheetState) {
  }


  private get currentSheet(): FlSheet {
    return this.spreadsheetState.currentSheet;
  }

  public get currentSelection(): FlSheetSelection {
    return this.currentSelection$.value;
  }


  public selectUniqueCell(cell: FlCellWithCoord): void {
    this.startSelection();
    this.unselectCurrentSelection();
    const selection: FlSheetSelection = FlSheetSelection.Single(this.currentSheet, cell.coord.row, cell.coord.column);
    cell.cell.select(selection.selectionRange());
    this.currentSelection$.next(selection);
  }

  public selectUniqueRow(rowIndex: number): void {
    this.startSelection();
    this.unselectCurrentSelection();
    const selection: FlSheetSelection = FlSheetSelection.Rows(this.currentSheet, rowIndex, rowIndex);
    this.selectCellsFromSelection(selection);
    this.currentSelection$.next(selection);
  }

  public selectUniqueColumn(columnIndex: number): void {
    this.startSelection();
    this.unselectCurrentSelection();
    const selection: FlSheetSelection = FlSheetSelection.Columns(this.currentSheet, columnIndex, columnIndex);
    this.selectCellsFromSelection(selection);
    this.currentSelection$.next(selection);
  }

  public clearCurrentSelection(): void {
    this.unselectCurrentSelection();
    this.currentSelection$.next(null);
  }


  private unselectCurrentSelection(): void {
    if (this.currentSelection != null) {
      this.unSelectCellsFromSelection(this.currentSelection);
    }
  }

  private selectCellsFromSelection(selection: FlSheetSelection): void {
    const range: FlSheetSelectionRange = selection.selectionRange();
    const cells: FlCell[] = this.getCellsFromRange(range);

    for (const cell of cells) {
      cell.select(range);
    }
  }

  private unSelectCellsFromSelection(selection: FlSheetSelection): void {
    const range: FlSheetSelectionRange = selection.selectionRange();
    const cells: FlCell[] = this.getCellsFromRange(range);

    for (const cell of cells) {
      cell.unselect();
    }
  }

  private getCellsFromRange(range: FlSheetSelectionRange): FlCell[] {
    return this.currentSheet.getCellsFromRange(range);
  }

  public startSelection(): void {
    this._isSelecting = true;
  }

  public endSelection(): void {
    this._isSelecting = false;
  }

  public get isSelecting(): boolean {
    return this._isSelecting;
  }

  public expandSelection(coord: FlCellCoord): void {
    if (!this._isSelecting || this.currentSelection == null ||
      (this.currentSelection.type !== 'single' && this.currentSelection.type !== 'multiple')) {
      return;
    }

    const newSelection: FlSheetSelection = this.currentSelection.expandSelection(coord.row, coord.column);
    // todo use difference between selection instead of clear
    this.unselectCurrentSelection();
    this.selectCellsFromSelection(newSelection);

    this.currentSelection$.next(newSelection);
  }

  public expandRowsSelection(rowIndex: number): void {
    if (!this._isSelecting || this.currentSelection == null || this.currentSelection.type !== 'rows') {
      return;
    }

    this.unselectCurrentSelection();
    const newSelection: FlSheetSelection = this.currentSelection.expandRowsSelection(rowIndex);
    this.selectCellsFromSelection(newSelection);

    this.currentSelection$.next(newSelection);
  }

  public expandColumnsSelection(rowIndex: number): void {
    if (!this._isSelecting || this.currentSelection == null || this.currentSelection.type !== 'columns') {
      return;
    }

    this.unselectCurrentSelection();
    const newSelection: FlSheetSelection = this.currentSelection.expandColumnsSelection(rowIndex);
    this.selectCellsFromSelection(newSelection);

    this.currentSelection$.next(newSelection);
  }

  public getSelection(): Observable<FlSheetSelection> {
    return this.currentSelection$.asObservable();
  }

  ngOnDestroy(): void {
    this.currentSelection$.complete();
  }


}

