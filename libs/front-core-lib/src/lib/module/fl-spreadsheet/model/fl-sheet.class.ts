import {FlBasicCell, FlCell} from './fl-cell.class';
import {BehaviorSubject, Observable} from 'rxjs';
import {debounceTime, map} from 'rxjs/operators';
import {FlCellCoord} from './fl-cell-coord.class';
import {
  FlSheetHeader,
  FlSheetHeaderInfo,
  FlSheetHeaderInfoInput,
  FlSheetHeaders,
  FlSheetRow
} from './fl-sheet-headers.class';
import {FlSpreadsheetHelper} from '../utils/fl-spreadsheet.helper';


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

  private loadedRowsCount: number = 0;
  private loadedColumnsCount: number = 0;

  // for lazy loaded sheet
  public totalRowsCount: number = 0;
  public totalColumnsCount: number = 0;

  // offset (nb of rows or column) when not starting at the row or columns
  public rowOffset: number = 0;
  public columnOffset: number = 0;

  public rows: FlSheetHeaders = new FlSheetHeaders();
  public columns: FlSheetHeaders = new FlSheetHeaders();

  constructor(name: string) {
    this.name = name;
    this.id = FlSheet.idGenerator++;
    this.cells = [];
    this.cellsChanged = new BehaviorSubject(null);
    this.rowsChanged = new BehaviorSubject(0);
    this.columnsChanged = new BehaviorSubject(0);
  }

  ////////////////////////////// COLUMN ///////////////////////////////
  /**
   * Append columns at the end of the sheet
   * @param count
   * @param updateTotalCount if true the column are considered as new and the total column count is incremented
   * otherwise is it considered as a lazy loaded column( included in the total count)
   */
  public appendMultipleColumns(count: number, updateTotalCount: boolean = true): void {
    for (let i = 0; i < count; i++) {
      this.createColumn(this.loadedColumnsCount, updateTotalCount);
    }

    this.emitCellChange();
    this.emitColumnsChange();
  }

  /**
   * Insert multiple column columns at the end of the sheet
   * @param from
   * @param to inclusive
   * @param updateTotalCount if true the column are considered as new and the total column count is incremented
   * otherwise is it considered as a lazy loaded column( included in the total count)
   */
  public insertMultipleColumns(from: number, to: number, updateTotalCount: boolean = true): void {
    for (let i = from; i <= to; i++) {
      this.createColumn(i, updateTotalCount);
    }
    this.emitCellChange();
    this.emitColumnsChange();
  }

  /**
   * Insert a column at the given position
   * @param position
   * @param updateTotalCount if true the column are considered as new and the total column count is incremented
   * otherwise is it considered as a lazy loaded column( included in the total count)
   */
  public insertColumn(position?: number, updateTotalCount: boolean = true): void {
    if (position == null || position > this.loadedColumnsCount) {
      position = this.loadedColumnsCount;
    }

    this.createColumn(position, updateTotalCount);

    this.emitCellChange();
    this.emitColumnsChange();
  }

  // create an empty column without emitting
  private createColumn(position: number, updateTotalCount: boolean = true): void {
    // add cell for each row
    for (let i = 0; i < this.loadedRowsCount; i++) {
      this.insertCell(i, position);
    }

    this.columns.createInfo(position);

    this.loadedColumnsCount++;
    if (updateTotalCount) {
      this.totalColumnsCount++;
    }
  }

  // delete columns in the interval inclusive
  public deleteColumns(from: number, to: number, updateTotalCount: boolean = true): void {
    const fromIndex: number = Math.min(from, to);
    const deleteCount: number = Math.max(from, to) - fromIndex + 1;

    // delete cells for each rows
    for (let i = 0; i < this.loadedRowsCount; i++) {
      this.cells[i].splice(fromIndex, deleteCount);
    }

    this.loadedColumnsCount -= deleteCount;
    if (updateTotalCount) {
      this.totalColumnsCount -= deleteCount;
    }

    // security to prevent sheet without columns
    if (this.loadedColumnsCount <= 0) {
      this.insertColumn(0);
    }

    this.columns.deleteInfo(fromIndex, deleteCount);

    this.emitCellChange();
    this.emitColumnsChange();
  }

  private emitColumnsChange(): void {
    this.columnsChanged.next(this.loadedColumnsCount);
  }

  public getColumnsCount$(): Observable<number> {
    return this.columnsChanged.asObservable().pipe(
      debounceTime(50)
    );
  }

  public findColumnIndex(name: string): number {
    return this.columns.findIndexByName(name);
  }

  /**
   * return the name of a column index including the column offset
   * @param index
   */
  public getColumnOffsetIndexName$(index: number): Observable<string> {
    return this.getColumnsCount$().pipe(
      map(() => FlSpreadsheetHelper.columnIndexToName(this.getColumnOffsetIndex(index)))
    );
  }

  // get the real index of a column when including the offset
  public getColumnOffsetIndex(index: number): number {
    return index + this.columnOffset ;
  }

  ////////////////////////////// COLUMN HEADER ////////////////////////////////

  public getColumnInfo(columnIndex: number): FlSheetHeaderInfo {
    return this.columns.getInfo(columnIndex);
  }

  public columnHasInfo(columnIndex: number): boolean {
    return this.columns.hasInfo(columnIndex);
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
            tags: columnInfo.tags,
          });
        }
        return columns;
      })
    );
  }

  public searchColumns(name: string): string[] {
    return this.columns.searchByName(name);
  }

  /**
   * Get all the column name from index with default to index if the name does not exist
   */
  public getColumnNames(fromColumn: number, toColumn: number): string[] {
    return this.columns.getNames(fromColumn, toColumn);
  }

  ////////////////////////////// ROW ///////////////////////////////
  /**
   * Append multiple rows at the end of the sheet
   * @param count
   * @param updateTotalCount if true the column are considered as new and the total column count is incremented
   * otherwise is it considered as a lazy loaded column( included in the total count)
   */
  public appendMultipleRows(count: number, updateTotalCount: boolean = true): void {
    for (let i = 0; i < count; i++) {
      this.createRow(this.loadedRowsCount, updateTotalCount);
    }

    this.emitCellChange();
    this.emitRowsChange();
  }

  /**
   * Insert multiple rows at a given position
   * @param from
   * @param to inclusive
   * @param updateTotalCount if true the column are considered as new and the total column count is incremented
   * otherwise is it considered as a lazy loaded column( included in the total count)
   */
  public insertMultipleRows(from: number, to: number, updateTotalCount: boolean = true): void {
    for (let i = from; i <= to; i++) {
      this.createRow(i, updateTotalCount);
    }
    this.emitCellChange();
    this.emitRowsChange();
  }

  /**
   * Insert a column at the given position
   * @param position
   * @param updateTotalCount if true the column are considered as new and the total column count is incremented
   * otherwise is it considered as a lazy loaded column( included in the total count)
   */
  public insertRow(position?: number, updateTotalCount: boolean = true): void {
    if (position == null || position > this.loadedRowsCount) {
      position = this.loadedRowsCount;
    }

    this.createRow(position, updateTotalCount);
    this.emitCellChange();
    this.emitRowsChange();
  }

  // create an empty column without emitting
  private createRow(position: number, updateTotalCount: boolean = true): void {
    // create the row
    this.cells.splice(position, 0, []);

    // add cell for each row
    for (let i = 0; i < this.loadedColumnsCount; i++) {
      this.insertCell(position, i);
    }

    this.rows.createInfo(position);

    this.loadedRowsCount++;

    if (updateTotalCount) {
      this.totalRowsCount++;
    }
  }

  // delete rows in the interval inclusive
  public deleteRows(from: number, to: number, updateTotalCount: boolean = true): void {
    const fromIndex: number = Math.min(from, to);
    const deleteCount: number = Math.max(from, to) - fromIndex + 1;

    // delete rows
    this.cells.splice(fromIndex, deleteCount);

    this.loadedRowsCount -= deleteCount;
    if (updateTotalCount) {
      this.totalRowsCount -= deleteCount;
    }

    // security to prevent sheet without rows
    if (this.loadedRowsCount <= 0) {
      this.insertRow(0);
    }

    this.rows.deleteInfo(from, deleteCount);

    this.emitCellChange();
    this.emitRowsChange();
  }

  private emitRowsChange(): void {
    this.rowsChanged.next(this.loadedRowsCount);
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
            tags: info.tags,
          });
        }
        return rows;
      })
    );
  }

  /**
   * Append lazy loaded rows (from pagination) data at the end of the sheet.
   */
  public appendLazyLoadedNextRows(data: any[][], rowInfos: FlSheetHeaderInfoInput[]): void {
    // first index of the new rows
    const fromRowIndex = this.loadedRowsCount;
    // append rows at the end
    this.appendMultipleRows(data.length, false);

    // set cell values
    this.setValuesFromCoord(data, {row: fromRowIndex, column: 0});
    // set row info
    this.rows.setInfoFromIndex(rowInfos, fromRowIndex);
  }

  /**
   * Insert lazy loaded rows (from pagination) data at the beginning of the sheet.
   */
  public insertLazyLoadedPreviousRows(data: any[][], rowInfos: FlSheetHeaderInfoInput[]): void {
    // insert the rows at the beginning
    this.insertMultipleRows(0, data.length - 1, false);

    // set cell values
    this.setValuesFromCoord(data, {row: 0, column: 0});
    // set row info
    this.rows.setInfoFromIndex(rowInfos, 0);

    // recalculate the offset (can't be lower than 0)
    this.rowOffset = Math.max(0, this.rowOffset - data.length);
  }

  /**
   * Return true if not all the rows are loaded and a previous page exists for pagination
   * */
  public hasPreviousRowsPage(): boolean {
    return this.rowOffset > 0;
  }

  /**
   * Return true if not all the rows are loaded and a next page exists for pagination
   */
  public hasNextRowsPage(): boolean {
    return this.getLastRowsOffsetIndex() + 1 < this.totalRowsCount;
  }

  /**
   * return the name of a row index including the row offset
   * @param index
   */
  public getRowOffsetIndexName$(index: number): Observable<string> {
    return this.getRowsCount$().pipe(
      map(() => FlSpreadsheetHelper.rowIndexToName(this.getRowOffsetIndex(index)))
    );
  }

  // get the real index of a row when including the offset
  public getRowOffsetIndex(index: number): number {
    return index + this.rowOffset;
  }

  // get the real index of the last row when including the offset
  public getLastRowsOffsetIndex(): number {
    return this.getRowOffsetIndex(this.loadedRowsCount - 1);
  }

  public getFirstRowsOffsetIndex(): number {
    return this.getRowOffsetIndex(0);
  }

  /////////////////////////////////// ROWS HEADER /////////////////////


  public getRowInfo(rowIndex: number): FlSheetHeaderInfo {
    return this.rows.getInfo(rowIndex);
  }

  public rowHasInfo(rowIndex: number): boolean {
    return this.rows.hasInfo(rowIndex);
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
    const newRowsCount = (values.length + fromRow) - this.loadedRowsCount;
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
  public getLoadedColumnsCount(): number {
    return this.loadedColumnsCount;
  }

  public getLoadedRowsCount(): number {
    return this.loadedRowsCount;
  }

  /**
   * return true if the coord is within loaded cells of sheet
   */
  public coordIsLoaded(coord: FlCellCoord): boolean {
    return coord.row >= 0 && coord.row < this.loadedRowsCount &&
      coord.column >= 0 && coord.column < this.loadedColumnsCount;
  }

  /**
   * return true if the coord is within total size of the sheet
   */
  public coordIsValid(coord: FlCellCoord): boolean {
    return coord.row >= 0 && coord.row < this.totalRowsCount &&
      coord.column >= 0 && coord.column < this.totalColumnsCount;
  }

  public getCoordsWithOffset(coord: FlCellCoord): FlCellCoord {
    return {
      row: this.getRowOffsetIndex(coord.row),
      column: this.getColumnOffsetIndex(coord.column),
    };
  }

  public destroy(): void {
    this.rowsChanged.complete();
    this.columnsChanged.complete();
    this.cellsChanged.complete();
    this.getCellsFlat().forEach(cell => cell.destroy());
  }
}
