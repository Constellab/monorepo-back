import {Injectable, OnDestroy} from '@angular/core';
import {FlCellCoord, FlSheetSelection, FlSheetSelectionFull, FlSheetSelectionRange} from '../model/fl-sheet-selection.class';
import {BehaviorSubject, Observable} from 'rxjs';
import {FlSpreadsheetState} from './fl-spreadsheet.state';
import {FlSheet} from '../model/fl-sheet.class';
import {FlCell} from '../model/fl-cell.class';

/**
 * Unique state shared across the spreadsheet to manage the selection
 */
@Injectable()
export class FlSpreadsheetSelectionState implements OnDestroy {

  private currentSelection$: BehaviorSubject<FlSheetSelectionFull> =
    new BehaviorSubject<FlSheetSelectionFull>(null);

  private _isSelecting: boolean = false;

  constructor(private spreadsheetState: FlSpreadsheetState) {
  }


  private get currentSheet(): FlSheet {
    return this.spreadsheetState.currentSheet;
  }

  /**
   * Return a simple FlSheetSelection without the edit method because
   * the outside must not edit the selection
   */
  public get currentSelection(): FlSheetSelection {
    return this.currentSelection$.value;
  }

  private get currentSelectionFull(): FlSheetSelectionFull {
    return this.currentSelection$.value;
  }

  public selectUniqueCell(coord: FlCellCoord, endSelection: boolean = false): void {
    const selection: FlSheetSelectionFull = FlSheetSelectionFull.Single(this.currentSheet, coord.row, coord.column);
    this.newSelection(selection, endSelection);
  }

  public selectMultipleCell(from: FlCellCoord, to: FlCellCoord, endSelection: boolean = false): void {
    const selection: FlSheetSelectionFull = FlSheetSelectionFull.Multiple(this.currentSheet,
      from.row, from.column, to.row, to.column);
    this.newSelection(selection, endSelection);
  }

  public selectUniqueRow(rowIndex: number, endSelection: boolean = false): void {
    const selection: FlSheetSelectionFull = FlSheetSelectionFull.Rows(this.currentSheet, rowIndex, rowIndex);
    this.newSelection(selection, endSelection);
  }

  public selectUniqueColumn(columnIndex: number, endSelection: boolean = false): void {
    const selection: FlSheetSelectionFull = FlSheetSelectionFull.Columns(this.currentSheet, columnIndex, columnIndex);
    this.newSelection(selection, endSelection);
  }

  public setSelection(sheet: FlSheet, range: FlSheetSelectionRange): void {
    const selection: FlSheetSelectionFull = FlSheetSelectionFull.FromRange(sheet, range);
    this.newSelection(selection, true);
  }

  private newSelection(selection: FlSheetSelectionFull, endSelection: boolean = false): void {
    if (!endSelection) {
      this.startSelection();
    }

    this.unselectCurrentSelection();
    this.selectCellsFromSelection(selection);
    this.currentSelection$.next(selection);

    if (endSelection) {
      this.endSelection();
    }
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
    const cells: FlCell[] = selection.getSelectedCellsFlat();

    for (const cell of cells) {
      cell.select(selection);
    }
  }

  private unSelectCellsFromSelection(selection: FlSheetSelection): void {
    const cells: FlCell[] = selection.getSelectedCellsFlat();

    for (const cell of cells) {
      cell.unselect();
    }
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
    const currentSelectionFull: FlSheetSelectionFull = this.currentSelectionFull;

    // check if the current selection is valid to expand
    if (!this._isSelecting || currentSelectionFull == null ||
      (currentSelectionFull.type !== 'single' && currentSelectionFull.type !== 'multiple')) {
      return;
    }

    const endCoord: FlCellCoord = currentSelectionFull.getEndCoord();
    // if the end selection didn't change
    if (endCoord.row === coord.row && endCoord.column === coord.column) {
      return;
    }

    const newSelection: FlSheetSelectionFull = currentSelectionFull.expandSelection(coord.row, coord.column);
    // todo use difference between selection instead of clear
    this.unselectCurrentSelection();
    this.selectCellsFromSelection(newSelection);

    this.currentSelection$.next(newSelection);
  }

  public expandRowsSelection(rowIndex: number): void {
    if (!this._isSelecting || this.currentSelectionFull == null || this.currentSelectionFull.type !== 'rows') {
      return;
    }

    this.unselectCurrentSelection();
    const newSelection: FlSheetSelectionFull = this.currentSelectionFull.expandRowsSelection(rowIndex);
    this.selectCellsFromSelection(newSelection);

    this.currentSelection$.next(newSelection);
  }

  public expandColumnsSelection(rowIndex: number): void {
    if (!this._isSelecting || this.currentSelectionFull == null || this.currentSelectionFull.type !== 'columns') {
      return;
    }

    this.unselectCurrentSelection();
    const newSelection: FlSheetSelectionFull = this.currentSelectionFull.expandColumnsSelection(rowIndex);
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

