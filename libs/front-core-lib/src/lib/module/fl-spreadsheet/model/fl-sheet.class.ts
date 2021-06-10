import {FlBasicCell, FlCell, FlColumnHeaderCell} from './fl-cell.class';
import {BehaviorSubject, Observable} from 'rxjs';
import {debounceTime, map} from 'rxjs/operators';
import {FlCellCoord, FlSheetSelectionRange} from './fl-sheet-selection.class';
import {FlSheetRow} from './fl-sheet-row.class';

export class FlSheet {

  private static idGenerator: number = 0;
  public id: number;

  public name: string;

  // the main array represent rows, cells[0] is the first row
  private readonly cells: FlCell[][];
  private readonly cellsChanged: BehaviorSubject<void>;

  private rowsCount: number = 0;
  private columnsCount: number = 0;


  constructor(name: string) {
    this.name = name;
    this.id = FlSheet.idGenerator++;
    this.cells = [];
    this.cellsChanged = new BehaviorSubject(null);
  }

  ////////////////////////////// COLUMN ///////////////////////////////
  public appendMultipleColumns(count: number): void {
    for (let i = 0; i < count; i++) {
      this.createColumn(this.columnsCount);
    }

    this.emitCellChange();
  }


  public insertMultipleColumns(from: number, to: number): void {
    for (let i = from; i <= to; i++) {
      this.createColumn(i);
    }
    this.emitCellChange();
  }


  public insertColumn(position?: number): void {
    if (position == null || position > this.columnsCount) {
      position = this.columnsCount;
    }

    this.createColumn(position);

    this.emitCellChange();
  }

  // create an empty column without emitting
  private createColumn(position: number): void {
    // add cell for each row
    for (let i = 0; i < this.rowsCount; i++) {
      this.insertCell(i, position);
    }
    this.columnsCount++;
  }

  // delete columns in the interval inclusive
  public deleteColumns(from: number, to: number): void {
    const fromIndex: number = Math.min(from, to);
    const deleteCount: number = Math.max(from, to) - fromIndex + 1;

    // delete cells for each rows
    for (let i = 0; i < this.rowsCount; i++) {
      this.cells[i].splice(fromIndex, deleteCount);
    }

    this.columnsCount -= deleteCount;

    // security to prevent sheet without columns
    if (this.columnsCount <= 0) {
      this.insertColumn(0);
    }

    this.emitCellChange();
  }


  ////////////////////////////// ROW ///////////////////////////////
  public appendMultipleRows(count: number): void {
    for (let i = 0; i < count; i++) {
      this.createRow(this.rowsCount);
    }

    this.emitCellChange();
  }

  public insertMultipleRows(from: number, to: number): void {
    for (let i = from; i <= to; i++) {
      this.createRow(i);
    }
    this.emitCellChange();
  }


  public insertRow(position?: number): void {
    if (position == null || position > this.rowsCount) {
      position = this.rowsCount;
    }

    this.createRow(position);
    this.emitCellChange();
  }

  // create an empty column without emitting
  private createRow(position: number): void {
    // create the row
    this.cells.splice(position, 0, []);

    // add cell for each row
    for (let i = 0; i < this.columnsCount; i++) {
      this.insertCell(position, i);
    }
    this.rowsCount++;
  }

  // delete rows in the interval inclusive
  public deleteRows(from: number, to: number): void {
    const fromIndex: number = Math.min(from, to);
    const deleteCount: number = Math.max(from, to) - fromIndex + 1;

    // delete rows
    this.cells.splice(fromIndex, deleteCount);

    this.rowsCount -= deleteCount;

    // security to prevent sheet without rows
    if (this.rowsCount <= 0) {
      this.insertRow(0);
    }

    this.emitCellChange();
  }

  ////////////////////////////// CELL ///////////////////////////////


  private insertCell(rowIndex: number, columnIndex: number): void {
    this.cells[rowIndex].splice(columnIndex, 0, new FlBasicCell());
  }

  public getCells(): Observable<FlCell[][]> {
    return this.cellsChanged.asObservable().pipe(
      debounceTime(50),
      map(() => this.cells)
    );
  }

  public getRows$(): Observable<FlSheetRow[]> {
    return this.getCells().pipe(
      map(cells => cells.map((row, index) => {
        return {
          rowId: index,
          cells: row
        };
      }))
    );
  }

  public getColumnHeaderCells(): Observable<FlCell[]> {
    return this.cellsChanged.asObservable().pipe(
      debounceTime(50),
      map(() => this.generateColumnHeaderCells())
    );
  }

  private generateColumnHeaderCells(): FlCell[] {
    return Array(this.columnsCount + 1).fill(null).map((value: null, index: number) => new FlColumnHeaderCell(index));
  }


  private emitCellChange(): void {
    this.cellsChanged.next();
  }

  public findCell(id: number): FlCell {
    for (const row of this.cells) {
      const cell: FlCell | null = row.find(cell => cell.id === id);
      if (cell != null) {
        return cell;
      }
    }
    return null;
  }

  public getCell(row: number, column: number): FlCell {
    return this.cells[row][column];
  }

  /**
   * Get the selection cell from a range in a simple array
   * Array is flatten by rows
   * @param range
   */
  public getCellsFromRangeFlat(range: FlSheetSelectionRange): FlCell[] {
    const cells: FlCell[] = [];

    for (let row = range.from.row; row <= range.to.row; row++) {
      cells.push(...this.cells[row].slice(range.from.column, range.to.column + 1));
    }

    return cells;
  }

  public getCellsFromRange(range: FlSheetSelectionRange): FlCell[][] {
    return this.getCellsFromCoords(range.from, range.to);
  }

  public getCellsFromCoords(from: FlCellCoord, to: FlCellCoord): FlCell[][] {
    const cells: FlCell[][] = [];

    for (let row = from.row; row <= to.row; row++) {
      cells.push(this.cells[row].slice(from.column, to.column + 1));
    }

    return cells;
  }

  public getRows(fromRow: number, toRow: number): FlSheetRow[] {
    const rows: FlSheetRow[] = [];

    for (let row = fromRow; row <= toRow; row++) {
      rows.push({
        rowId: row,
        cells: this.cells[row]
      });
    }

    return rows;
  }

  public setValuesFromCoord(values: any[][], from: FlCellCoord): void {
    for (let i = 0; i < values.length; i++) {
      const cellRow: number = i + from.row;
      // loop through all the columns of row
      for (let j = 0; j < values[i].length; j++) {
        const cellColumn: number = j + from.column;

        const cell: FlCell = this.cells[cellRow][cellColumn];
        if (cell != null) {
          cell.value = values[i][j];
        }
      }
    }
  }


  ////////////////////////////// CELL ///////////////////////////////
  public getColumnsCount(): number {
    return this.columnsCount;
  }

  public getRowsCount(): number {
    return this.rowsCount;
  }

  /**
   * return true if the coord is within the sheet size
   */
  public coordIsValid(coord: FlCellCoord): boolean {
    return coord.row >= 0 && coord.row < this.rowsCount &&
      coord.column >= 0 && coord.column < this.columnsCount;
  }

  /**
   * return true if the range is within the sheet size
   */
  public rangeIsValid(range: FlSheetSelectionRange): boolean {
    return this.coordIsValid(range.from) && this.coordIsValid(range.to);
  }

  /**
   * Check if the range is within the sheet size
   * If range is valid, returns null
   * Otherwise it return the coord that is wrong
   * @param range
   */
  public checkRangeValidity(range: FlSheetSelectionRange): FlCellCoord | null {
    if (!this.coordIsValid(range.from)) {
      return range.from;
    }

    if (!this.coordIsValid(range.to)) {
      return range.to;
    }

    return null;
  }
}
