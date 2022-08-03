import {Observable} from 'rxjs';
import {FlSheetHeaderInfoInput} from './fl-sheet-headers.class';

export interface FlSpreadsheetPage {
  data: any[][];
  rows: FlSheetHeaderInfoInput[];
}

/**
 * Object for the FlSpreadsheet component to manage pagination of the data (getting page)
 */
export interface FlSpreadsheetPageLoader {

  /**
   * Load the next page of data
   * @param fromRow inclusive
   */
  loadRows(fromRow: number): Observable<FlSpreadsheetPage>;

  /**
   * Load previous rows
   * @param toRow exclusive (get the rows before this index)
   */
  loadPreviousRows(toRow: number): Observable<FlSpreadsheetPage>;
}
