import {Injectable, OnDestroy} from '@angular/core';
import {FlCell, FlSpreadsheet} from '@monorepo/front-core-lib';
import {FlCellCoord, FlCellWithCoord, FlSheetSelectionChange, FlSheetSelectionRange} from '../model/fl-sheet-selection-change.class';
import {BehaviorSubject, Observable} from 'rxjs';

@Injectable()
export class FlSpreadsheetState implements OnDestroy {

  private spreadsheet: FlSpreadsheet;

  private currentSelection$: BehaviorSubject<FlSheetSelectionChange> =
    new BehaviorSubject<FlSheetSelectionChange>(null);

  private _isSelecting: boolean = false;

  public init(spreadsheet: FlSpreadsheet): void {
    this.spreadsheet = spreadsheet;
  }

  public get currentSelection(): FlSheetSelectionChange {
    return this.currentSelection$.value;
  }


  public selectUniqueCell(cell: FlCellWithCoord): void {
    this.clearCurrentSelection();
    const selection: FlSheetSelectionChange = FlSheetSelectionChange.Single(cell.coord.row, cell.coord.column);
    cell.cell.select(selection.selectionRange());
    this.currentSelection$.next(selection);
  }

  public selectUniqueRow(rowIndex: number): void {
    this.clearCurrentSelection();
    const selection: FlSheetSelectionChange = FlSheetSelectionChange.Rows(rowIndex, rowIndex);
    this.selectCellsFromSelection(selection);
    this.currentSelection$.next(selection);
  }

  public selectUniqueColumn(columnIndex: number): void {
    this.clearCurrentSelection();
    const selection: FlSheetSelectionChange = FlSheetSelectionChange.Columns(columnIndex, columnIndex);
    this.selectCellsFromSelection(selection);
    this.currentSelection$.next(selection);
  }


  private clearCurrentSelection(): void {
    if (this.currentSelection != null) {
      this.unSelectCellsFromSelection(this.currentSelection);
    }
  }

  private selectCellsFromSelection(selection: FlSheetSelectionChange): void {
    const range: FlSheetSelectionRange = selection.selectionRange();
    const cells: FlCell[] = this.getCellsFromRange(range);

    for (const cell of cells) {
      cell.select(range);
    }
  }

  private unSelectCellsFromSelection(selection: FlSheetSelectionChange): void {
    const range: FlSheetSelectionRange = selection.selectionRange();
    const cells: FlCell[] = this.getCellsFromRange(range);

    for (const cell of cells) {
      cell.unselect();
    }
  }

  private getCellsFromRange(range: FlSheetSelectionRange): FlCell[] {
    return this.spreadsheet.currentSheet.getCellsFromRange(range);
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

    const newSelection: FlSheetSelectionChange = this.currentSelection.expandSelection(coord.row, coord.column);
    // todo use difference between selection instead of clear
    this.clearCurrentSelection();
    this.selectCellsFromSelection(newSelection);

    this.currentSelection$.next(newSelection);
  }

  public expandRowsSelection(rowIndex: number): void {
    if (!this._isSelecting || this.currentSelection == null || this.currentSelection.type !== 'rows') {
      return;
    }

    this.clearCurrentSelection();
    const newSelection: FlSheetSelectionChange = this.currentSelection.expandRowsSelection(rowIndex);
    this.selectCellsFromSelection(newSelection);

    this.currentSelection$.next(newSelection);
  }

  public expandColumnsSelection(rowIndex: number): void {
    if (!this._isSelecting || this.currentSelection == null || this.currentSelection.type !== 'columns') {
      return;
    }

    this.clearCurrentSelection();
    const newSelection: FlSheetSelectionChange = this.currentSelection.expandColumnsSelection(rowIndex);
    this.selectCellsFromSelection(newSelection);

    this.currentSelection$.next(newSelection);
  }

  public getSelection(): Observable<FlSheetSelectionChange> {
    return this.currentSelection$.asObservable();
  }

  ngOnDestroy(): void {
    this.currentSelection$.complete();
  }


}

