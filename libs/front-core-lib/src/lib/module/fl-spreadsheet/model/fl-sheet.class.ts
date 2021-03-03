import {FlBasicCell, FlCell, FlColumnHeaderCell} from './fl-cell.class';
import {BehaviorSubject, Observable} from 'rxjs';
import {debounceTime, map} from 'rxjs/operators';

export class FlSheet {

  public name: string;

  // the main array represent rows, cells[0] is the first row
  private readonly cells: FlCell[][];
  private readonly cellsChanged: BehaviorSubject<void>;

  private rowsCount: number = 0;
  private columnsCount: number = 0;


  constructor(name: string) {
    this.name = name;
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

}
