import {FlSheet} from '../model/fl-sheet.class';
import {ClCSVDelimiter, clCSVDelimiters, ClCSVHelper, clCSVLineSeparator} from '@monorepo/core-lib';


/**
 * Factory to create a spreadsheet
 */
export class FlSpreadsheetFactory {

  /**
   * Create a spreadsheet from any object
   */
  public static fromAny(values: any, sheetName: string): FlSheet {
    let array: any[][];


    if (Array.isArray(values)) {
      array = values;
    } else if (typeof values === 'string') {
      array = FlSpreadsheetFactory.convertStringToArray(values);
    } else {
      array = FlSpreadsheetFactory.convertObjectToArray(values);
    }

    return FlSpreadsheetFactory.fromArray(array, sheetName);
  }

  /**
   * Create a spreadsheet with a single sheet, initiated with the values
   * @param values
   * @param sheetName
   */
  public static fromArray(values: any[][], sheetName: string): FlSheet {
    const sheet: FlSheet = new FlSheet(sheetName);

    // get the maximum number of columns from the values
    const maxColumnsLength: number = values.reduce((m, x) => m.length > x.length ? m : x, []).length;

    // create the columns
    sheet.appendMultipleColumns(maxColumnsLength);

    // create the rows and set value
    // we add one row to improve scroll experience
    sheet.appendMultipleRows(values.length + 1);

    // set the cell values
    sheet.setValuesFromCoord(values, {row: 0, column: 0});

    return sheet;
  }

  /**
   * Create a spreadsheet from a CSV string
   * If no separator provided, detect it automatically
   */
  public static fromCSV(csv: string, sheetName: string, separator?: string): FlSheet {
    const values: any[][] = [];
    const lines: string[] = csv.split(clCSVLineSeparator);

    if (separator == null) {
      const delimiter: ClCSVDelimiter = ClCSVHelper.detectDelimiter(csv) ?? clCSVDelimiters[0];
      separator = delimiter.delimiter;
    }

    for (const line of lines) {
      values.push(line.split(separator));
    }
    return FlSpreadsheetFactory.fromArray(values, sheetName);
  }

  /**
   * Convert a string to an array of array for spreadsheet a spreadsheet from a string
   */
  public static convertStringToArray(str: string): any[][] {
    const lines: string[] = str.split('\n');
    return lines.map(line => [line]);
  }


  /**
   * Convert a basic json object to an array of array for spreadsheet
   * It uses the each attribute as column
   */
  public static convertObjectToArray(object: Record<string, any>): any[][] {
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

    return values;
  }
}
