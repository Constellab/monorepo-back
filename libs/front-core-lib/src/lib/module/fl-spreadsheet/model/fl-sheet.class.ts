import {FlBasicCell, FlCell, FlColumnHeaderCell} from './fl-cell.class';
import {BehaviorSubject, Observable} from 'rxjs';
import {debounceTime, map} from 'rxjs/operators';
import {FlSheetSelectionRange} from './fl-sheet-selection-change.class';

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
  public insertColumn(position?: number): void {
    if (position == null || position > this.columnsCount) {
      position = this.columnsCount;
    }

    // add cell for each row
    for (let i = 0; i < this.rowsCount; i++) {
      this.insertCell(i, position);
    }
    this.columnsCount++;
    this.emitCellChange();
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
  public insertRow(position?: number): void {
    if (position == null || position > this.rowsCount) {
      position = this.rowsCount;
    }

    // create the row
    this.cells.splice(position, 0, []);

    // add cell for each row
    for (let i = 0; i < this.columnsCount; i++) {
      this.insertCell(position, i);
    }
    this.rowsCount++;
    this.emitCellChange();
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

  public getCellsFromRange(range: FlSheetSelectionRange): FlCell[] {
    const cells: FlCell[] = [];

    // the to values can be Infinity
    const toRow: number = Math.min(range.to.row, (this.rowsCount - 1));
    const toColumn: number = Math.min(range.to.column, (this.columnsCount - 1));

    for (let row = range.from.row; row <= toRow; row++) {
      cells.push(...this.cells[row].slice(range.from.column, toColumn + 1));
    }

    return cells;
  }


  ////////////////////////////// CELL ///////////////////////////////
  public getColumnsCount(): number {
    return this.columnsCount;
  }

  public getRowsCount(): number {
    return this.rowsCount;
  }

}
