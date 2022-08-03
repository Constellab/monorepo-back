import {RvResourceViewBase} from './rv-resource-view.class';
import {FlSheet, FlSheetHeaders, FlSpreadsheet, FlSpreadsheetFactory} from '@monorepo/front-core-lib';

export interface RvResourceViewTable extends RvResourceViewBase {
  type: 'table-view' | 'dataset-view';
  data: RvResourceViewTableData;
}

export interface RvResourceViewTableData {
  table: any[][];
  rows: RvResourceViewTableHeader[];
  columns: RvResourceViewTableHeader[];
  from_column: number;
  from_row: number;
  number_of_columns_per_page: number;
  number_of_rows_per_page: number;
  total_number_of_columns: number;
  total_number_of_rows: number;
}

export interface RvResourceViewTableHeader {
  name: string;
  tags: Record<string, string>;
}

/**
 * Convert a Table view to a Spreadsheet
 * @param table
 * @param ignoreOffsets if true the offsets (fromRow and fromCol) are ignored
 */
export function rvTableToSpreadsheet(table: RvResourceViewTable, ignoreOffsets: boolean = false): FlSpreadsheet {
  const spreadSheet: FlSpreadsheet = new FlSpreadsheet();
  // if the resource is a csv file
  const sheet: FlSheet = FlSpreadsheetFactory.fromArray(table.data.table, table.title ?? 'Sheet 1');

  sheet.totalColumnsCount = table.data.total_number_of_columns;
  sheet.totalRowsCount = table.data.total_number_of_rows;
  sheet.columns = new FlSheetHeaders(table.data.columns);
  sheet.rows = new FlSheetHeaders(table.data.rows);

  if (!ignoreOffsets) {
    sheet.rowOffset = table.data.from_row - 1; // -1 because communication are based on 1-based index
    sheet.columnOffset = table.data.from_column - 1; // -1 because communication are based on 1-based index
  }
  spreadSheet.addSheet(sheet);
  return spreadSheet;
}
