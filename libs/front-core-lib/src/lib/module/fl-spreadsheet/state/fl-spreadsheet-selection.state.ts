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

  public selectUniqueCell(coord: FlCellCoord): void {
    const selection: FlSheetSelectionFull = FlSheetSelectionFull.Single(this.currentSheet, coord.row, coord.column);
    this.newSelection(selection);
  }

  public selectMultipleCell(from: FlCellCoord, to: FlCellCoord): void {
    const selection: FlSheetSelectionFull = FlSheetSelectionFull.Multiple(this.currentSheet,
      from.row, from.column, to.row, to.column);
    this.newSelection(selection);
  }

  public selectUniqueRow(rowIndex: number): void {
    const selection: FlSheetSelectionFull = FlSheetSelectionFull.Rows(this.currentSheet, rowIndex, rowIndex);
    this.newSelection(selection);
  }

  public selectUniqueColumn(columnIndex: number): void {
    const selection: FlSheetSelectionFull = FlSheetSelectionFull.Columns(this.currentSheet, columnIndex, columnIndex);
    this.newSelection(selection);
  }

  public setSelection(sheet: FlSheet, range: FlSheetSelectionRange): void {
    const selection: FlSheetSelectionFull = FlSheetSelectionFull.FromRange(sheet, range);
    this.newSelection(selection);
  }

  private newSelection(selection: FlSheetSelectionFull): void {
    this.unselectCurrentSelection();
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

  /**
   * Expand current selection with a shift from the current coord
   * @param rowShift
   * @param columnShift
   */
  public expandSelectionWithShift(rowShift: number, columnShift: number): void {
    const newCoord: FlCellCoord = this.shiftCurrentSelection(rowShift, columnShift);

    if (newCoord) {
      this.expandSelection(newCoord);
    }
  }

  public expandSelection(coord: FlCellCoord): void {
    if (!this.currentSheet.coordIsValue(coord)) {
      return;
    }

    const currentSelectionFull: FlSheetSelectionFull = this.currentSelectionFull;

    // check if the current selection is valid to expand
    if (currentSelectionFull == null ||
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
    if (this.currentSelectionFull == null || this.currentSelectionFull.type !== 'rows') {
      return;
    }

    this.unselectCurrentSelection();
    const newSelection: FlSheetSelectionFull = this.currentSelectionFull.expandRowsSelection(rowIndex);
    this.selectCellsFromSelection(newSelection);

    this.currentSelection$.next(newSelection);
  }

  public expandColumnsSelection(rowIndex: number): void {
    if (this.currentSelectionFull == null || this.currentSelectionFull.type !== 'columns') {
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


  public moveCurrentSelection(rowShift: number, columnShift: number): void {
    const newCoord: FlCellCoord = this.shiftCurrentSelection(rowShift, columnShift);

    if (newCoord) {
      this.selectUniqueCell(newCoord);
    }
  }

  // shit the current selection coord
  // return null if the new coord is not valid
  private shiftCurrentSelection(rowShift: number, columnShift: number): FlCellCoord | null {
    const selection: FlSheetSelection = this.currentSelection;

    if (selection != null) {

      const coord: FlCellCoord = {
        row: selection.getFirstSelectedCellCoord().row + rowShift,
        column: selection.getFirstSelectedCellCoord().column + columnShift,
      };

      if (this.currentSheet.coordIsValue(coord)) {
        return coord;
      }
    }

    return null;
  }

  ngOnDestroy(): void {
    this.currentSelection$.complete();
  }


}

