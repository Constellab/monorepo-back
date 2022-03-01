import {FlBasicCell, FlCell} from './fl-cell.class';
import {BehaviorSubject, Observable} from 'rxjs';
import {debounceTime, map} from 'rxjs/operators';
import {FlCellCoord} from './selection/fl-sheet-single-selection.class';
import {FlSheetHeader, FlSheetRow} from './fl-sheet-row.class';
import {FlTagHelper} from '../../fl-tag/fl-tag.class';

/**
 * Information about a row or a column in the sheet
 */
export interface FlSheetHeaderInfo {
  name?: string;
  tags?: Record<string, string>;
}

/**
 * Class to manage one sheet of a spreadsheet
 * It contains and manage all the cells of the sheet
 */
export class FlSheet {

  private static idGenerator: number = 0;
  public id: number;

  public name: string;

  // the main array represent rows, cells[0] is the first row
  private readonly cells: FlCell[][];

  private readonly cellsChanged: BehaviorSubject<void>;
  private readonly rowsChanged: BehaviorSubject<number>;
  private readonly columnsChanged: BehaviorSubject<number>;

  private rowsCount: number = 0;
  private columnsCount: number = 0;

  public rowsInfo: FlSheetHeaderInfo[];
  public columnsInfo: FlSheetHeaderInfo[];


  constructor(name: string) {
    this.name = name;
    this.id = FlSheet.idGenerator++;
    this.cells = [];
    this.cellsChanged = new BehaviorSubject(null);
    this.rowsChanged = new BehaviorSubject(0);
    this.columnsChanged = new BehaviorSubject(0);
  }

  ////////////////////////////// COLUMN ///////////////////////////////
  public appendMultipleColumns(count: number): void {
    for (let i = 0; i < count; i++) {
      this.createColumn(this.columnsCount);
    }

    this.emitCellChange();
    this.emitColumnsChange();
  }


  public insertMultipleColumns(from: number, to: number): void {
    for (let i = from; i <= to; i++) {
      this.createColumn(i);
    }
    this.emitCellChange();
    this.emitColumnsChange();
  }


  public insertColumn(position?: number): void {
    if (position == null || position > this.columnsCount) {
      position = this.columnsCount;
    }

    this.createColumn(position);

    this.emitCellChange();
    this.emitColumnsChange();
  }

  // create an empty column without emitting
  private createColumn(position: number): void {
    // add cell for each row
    for (let i = 0; i < this.rowsCount; i++) {
      this.insertCell(i, position);
    }

    if (this.columnsInfo?.length > 0) {
      this.columnsInfo.splice(position, 0, {name: null, tags: {}});
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

    if (this.columnsInfo?.length > 0) {
      this.columnsInfo.splice(fromIndex, deleteCount);
    }

    this.emitCellChange();
    this.emitColumnsChange();
  }

  private emitColumnsChange(): void {
    this.columnsChanged.next(this.columnsCount);
  }

  public getColumnsCount$(): Observable<number> {
    return this.columnsChanged.asObservable().pipe(
      debounceTime(50)
    );
  }

  public getColumnsTags(): Record<string, string[]> {
    return FlTagHelper.groupTagsByKey(this.columnsInfo.map(columnInfo => columnInfo.tags));
  }

  public getColumnInfo(columnIndex: number): FlSheetHeaderInfo {
    return this.getHeaderInfo(this.columnsInfo, columnIndex);
  }

  public getColumnTags(columnIndex: number): Record<string, string> {
    return this.columnsInfo ? this.columnsInfo[columnIndex].tags : {};
  }

  public getColumns$(): Observable<FlSheetHeader[]> {
    return this.getColumnsCount$().pipe(
      map((count) => {
        const columns: FlSheetHeader[] = [];

        for (let i = 0; i < count; i++) {
          const columnInfo = this.getColumnInfo(i);
          columns.push({
            index: i,
            name: columnInfo.name,
            tags: columnInfo.tags
          });
        }
        return columns;
      })
    );
  }

  ////////////////////////////// ROW ///////////////////////////////
  public appendMultipleRows(count: number): void {
    for (let i = 0; i < count; i++) {
      this.createRow(this.rowsCount);
    }

    this.emitCellChange();
    this.emitRowsChange();
  }

  public insertMultipleRows(from: number, to: number): void {
    for (let i = from; i <= to; i++) {
      this.createRow(i);
    }
    this.emitCellChange();
    this.emitRowsChange();
  }


  public insertRow(position?: number): void {
    if (position == null || position > this.rowsCount) {
      position = this.rowsCount;
    }

    this.createRow(position);
    this.emitCellChange();
    this.emitRowsChange();
  }

  // create an empty column without emitting
  private createRow(position: number): void {
    // create the row
    this.cells.splice(position, 0, []);

    // add cell for each row
    for (let i = 0; i < this.columnsCount; i++) {
      this.insertCell(position, i);
    }

    if (this.rowsInfo?.length > 0) {
      this.rowsInfo.splice(position, 0, {name: null, tags: {}});
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

    if (this.rowsInfo?.length > 0) {
      this.rowsInfo.splice(fromIndex, deleteCount);
    }


    this.emitCellChange();
    this.emitRowsChange();
  }

  private emitRowsChange(): void {
    this.rowsChanged.next(this.rowsCount);
  }

  public getRowsCount$(): Observable<number> {
    return this.rowsChanged.asObservable().pipe(
      debounceTime(50)
    );
  }

  public getRows$(): Observable<FlSheetRow[]> {
    return this.getRowsCount$().pipe(
      map(count => {
        const rows: FlSheetRow[] = [];

        for (let i = 0; i < count; i++) {
          const info = this.getRowInfo(i);
          rows.push({
            cells: this.cells[i],
            index: i,
            name: info.name,
            tags: info.tags
          });
        }
        return rows;
      })
    );

  }

  public getRowsTags(): Record<string, string[]> {
    return FlTagHelper.groupTagsByKey(this.rowsInfo.map(rowInfo => rowInfo.tags));
  }

  public getRowInfo(rowIndex: number): FlSheetHeaderInfo {
    return this.getHeaderInfo(this.rowsInfo, rowIndex);
  }

  ////////////////////////////// CELL ///////////////////////////////


  private insertCell(rowIndex: number, columnIndex: number): void {
    this.cells[rowIndex].splice(columnIndex, 0, new FlBasicCell());
  }

  public getCells$(): Observable<FlCell[][]> {
    return this.cellsChanged.asObservable().pipe(
      debounceTime(50),
      map(() => this.cells)
    );
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

  public getCellsFromCoordsFlat(from: FlCellCoord, to: FlCellCoord): FlCell[] {
    const cells: FlCell[][] = this.getCellsFromCoords(from, to);
    const flatCells: FlCell[] = [];

    cells.forEach(row => flatCells.push(...row));

    return flatCells;

  }

  public getCellsFromCoords(from: FlCellCoord, to: FlCellCoord): FlCell[][] {
    const cells: FlCell[][] = [];

    for (let row = from.row; row <= to.row; row++) {
      cells.push(this.cells[row].slice(from.column, to.column + 1));
    }

    return cells;
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

  /**
   * Set values for a column and add rows automatically it reached the limit
   * @param column
   * @param values
   * @param fromRow
   */
  public setColumnValues(column: number, values: any[], fromRow: number = 0): void {
    // create new rows if needed
    const newRowsCount = (values.length + fromRow) - this.rowsCount;
    if (newRowsCount > 0) {
      this.appendMultipleRows(newRowsCount);
    }

    for (let i = 0; i < values.length; i++) {
      const cellRow: number = i + fromRow;

      const cell: FlCell = this.cells[cellRow][column];
      if (cell != null) {
        cell.value = values[i];
      }
    }
  }

  private getCellsFlat(): FlCell[] {
    const cells: FlCell[] = [];

    for (const row of this.cells) {
      cells.push(...row);
    }

    return cells;
  }


  ////////////////////////////// Other ///////////////////////////////
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

  private getHeaderInfo(headerInfos: FlSheetHeaderInfo[], index: number): FlSheetHeaderInfo {
    // if it doesn't exist, return a default value
    if (!headerInfos || headerInfos[index] == null) {
      return {name: null, tags: {}};
    }
    return headerInfos[index];
  }

  public destroy(): void {
    this.rowsChanged.complete();
    this.columnsChanged.complete();
    this.cellsChanged.complete();
    this.getCellsFlat().forEach(cell => cell.destroy());
  }
}
