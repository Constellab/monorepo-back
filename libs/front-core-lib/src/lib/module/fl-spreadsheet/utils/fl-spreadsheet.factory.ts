import {FlSheet} from '../model/fl-sheet.class';
import {FlSpreadsheet} from '../model/fl-spreadsheet.class';


/**
 * Factory to create a spreadsheet
 */
export class FlSpreadsheetFactory {

  /**
   * Create a spreadsheet from any object
   */
  public static fromAny(values: any, defaultSheetName: string): FlSpreadsheet {
    if (Array.isArray(values)) {
      return FlSpreadsheetFactory.fromArray(values, defaultSheetName);
    } else {
      return FlSpreadsheetFactory.fromObject(values, defaultSheetName);
    }
  }

  /**
   * Create a spreadsheet with a single sheet, initiated with the values
   * @param values
   * @param defaultSheetName
   */
  public static fromArray(values: any[][], defaultSheetName: string): FlSpreadsheet {
    const spreadSheet: FlSpreadsheet = new FlSpreadsheet(defaultSheetName);
    const sheet: FlSheet = spreadSheet.currentSheet;

    // get the maximum number of columns from the values
    const maxColumnsLength: number = values.reduce((m, x) => m.length > x.length ? m : x, []).length;

    // create the columns
    sheet.appendMultipleColumns(maxColumnsLength);

    // create the rows and set value
    sheet.appendMultipleRows(values.length);

    // set the cell values
    sheet.setValuesFromCoord(values, {row: 0, column: 0});

    return spreadSheet;
  }

  /**
   * Create a spreadsheet from a basic json object
   * It uses the each attribute as column
   * @param object
   * @param defaultSheetName
   */
  public static fromObject(object: Record<string, any>, defaultSheetName: string): FlSpreadsheet {
    const values: any[][] = [];

    const header: string[] = [];
    const line: any[] = [];

    for (const key of Object.keys(object)) {
      // add the attribute name in the header array (first line of excel)
      header.push(key);

      // add the value of the attribute in the line containing values
      line.push(object[key]);
    }

    // add line to values
    values.push(header, line);

    return FlSpreadsheetFactory.fromArray(values, defaultSheetName);
  }
}
