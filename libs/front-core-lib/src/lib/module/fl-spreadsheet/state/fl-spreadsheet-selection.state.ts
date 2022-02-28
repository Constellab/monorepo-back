import {Injectable, OnDestroy} from '@angular/core';
import {
  FlCellCoord,
  FlSheetSingleSelection,
  FlSheetSingleSelectionFull,
} from '../model/selection/fl-sheet-single-selection.class';
import {BehaviorSubject, Observable} from 'rxjs';
import {FlSpreadsheetState} from './fl-spreadsheet.state';
import {FlSheet} from '../model/fl-sheet.class';
import {FlSheetRange} from '../model/selection/fl-sheet-range.class';

/**
 * Unique state shared across the spreadsheet to manage the selection
 */
@Injectable()
export class FlSpreadsheetSelectionState implements OnDestroy {

  private currentSelection$: BehaviorSubject<FlSheetSingleSelectionFull> =
    new BehaviorSubject<FlSheetSingleSelectionFull>(null);

  constructor(private state: FlSpreadsheetState) {

  }

  public init(): void {
    this.clearSelectionOnNewSheet();
  }

  // listen to the sheet change and clear selection when we changed the sheet
  private clearSelectionOnNewSheet(): void {
    this.state.currentSheet$.subscribe(
      () => this.clearCurrentSelection()
    );
  }

  // todo to change with current sheet
  private get currentSheet(): FlSheet {
    return this.state.currentSheet;
  }

  /**
   * Return a simple FlSheetSelection without the edit method because
   * the outside must not edit the selection
   */
  public get currentSelection(): FlSheetSingleSelection {
    return this.currentSelection$.value;
  }

  private get currentSelectionFull(): FlSheetSingleSelectionFull {
    return this.currentSelection$.value;
  }

  public selectUniqueCell(coord: FlCellCoord): FlSheetSingleSelection {
    const selection: FlSheetSingleSelectionFull = FlSheetSingleSelectionFull.Single(this.currentSheet, coord.row, coord.column);
    this.newSelection(selection);
    return selection;
  }

  public selectMultipleCell(from: FlCellCoord, to: FlCellCoord): FlSheetSingleSelection {
    const selection: FlSheetSingleSelectionFull = FlSheetSingleSelectionFull.Multiple(this.currentSheet,
      from.row, from.column, to.row, to.column);
    this.newSelection(selection);
    return selection;
  }

  public selectUniqueRow(rowIndex: number): FlSheetSingleSelection {
    const selection: FlSheetSingleSelectionFull = FlSheetSingleSelectionFull.Rows(this.currentSheet, rowIndex, rowIndex);
    this.newSelection(selection);
    return selection;
  }

  public selectUniqueColumn(columnIndex: number): FlSheetSingleSelection {
    const selection: FlSheetSingleSelectionFull = FlSheetSingleSelectionFull.Columns(this.currentSheet, columnIndex, columnIndex);
    this.newSelection(selection);
    return selection;
  }

  public setSelection(sheet: FlSheet, range: FlSheetRange): FlSheetSingleSelection {
    const selection: FlSheetSingleSelectionFull = FlSheetSingleSelectionFull.FromRange(sheet, range);
    this.newSelection(selection);
    return selection;
  }

  private newSelection(selection: FlSheetSingleSelectionFull): void {
    this.currentSelection$.next(selection);
  }

  public clearCurrentSelection(): void {
    this.currentSelection$.next(null);
  }

  public expandSelection(coord: FlCellCoord): void {
    if (!this.currentSheet.coordIsValid(coord)) {
      return;
    }

    const currentSelectionFull: FlSheetSingleSelectionFull = this.currentSelectionFull;

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

    const newSelection: FlSheetSingleSelectionFull = currentSelectionFull.expandSelection(coord.row, coord.column);
    this.currentSelection$.next(newSelection);
  }

  public expandRowsSelection(rowIndex: number): void {
    if (this.currentSelectionFull == null || this.currentSelectionFull.type !== 'rows') {
      return;
    }

    const newSelection: FlSheetSingleSelectionFull = this.currentSelectionFull.expandRowsSelection(rowIndex);

    this.currentSelection$.next(newSelection);
  }

  public expandColumnsSelection(columnIndex: number): void {
    if (this.currentSelectionFull == null || this.currentSelectionFull.type !== 'columns') {
      return;
    }

    const newSelection: FlSheetSingleSelectionFull = this.currentSelectionFull.expandColumnsSelection(columnIndex);

    this.currentSelection$.next(newSelection);
  }

  public getSelection$(): Observable<FlSheetSingleSelection> {
    return this.currentSelection$.asObservable();
  }

  /**
   * Expand current selection with a shift from the current coord
   * @param rowShift
   * @param columnShift
   */
  public expandSelectionWithShift(rowShift: number, columnShift: number): void {
    const newCoord: FlCellCoord = this.shiftCurrentSelection(rowShift, columnShift);

    if (newCoord) {
      switch (this.currentSelection.type) {
        case 'rows':
          this.expandRowsSelection(newCoord.row);
          break;
        case 'columns':
          this.expandColumnsSelection(newCoord.column);
          break;
        default:
          this.expandSelection(newCoord);
          break;
      }
    }
  }


  public moveCurrentSelection(rowShift: number, columnShift: number): FlSheetSingleSelection | null {
    const newCoord: FlCellCoord = this.shiftCurrentSelection(rowShift, columnShift);

    if (newCoord) {

      switch (this.currentSelection.type) {
        case 'rows':
          return this.selectUniqueRow(newCoord.row);
        case 'columns':
          return this.selectUniqueColumn(newCoord.column);
        default:
          return this.selectUniqueCell(newCoord);

      }
    }

    return null;
  }

  // shit the current selection coord
  // return null if the new coord is not valid
  private shiftCurrentSelection(rowShift: number, columnShift: number): FlCellCoord | null {
    const selection: FlSheetSingleSelection = this.currentSelection;

    if (selection != null) {

      const coord: FlCellCoord = {
        row: selection.endRow + rowShift,
        column: selection.endColumn + columnShift,
      };

      if (this.currentSheet.coordIsValid(coord)) {
        return coord;
      }
    }

    return null;
  }

  public hasSelection(): boolean {
    return this.currentSelection != null;
  }

  ngOnDestroy(): void {
    this.currentSelection$.complete();
  }


}

