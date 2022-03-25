import {FlSheet} from '../model/fl-sheet.class';
import {ClCSVDelimiter, clCSVDelimiters, ClCSVHelper, ClCsvJson, clCSVLineSeparator} from '@monorepo/core-lib';
import {FlTranslateService} from '../../fl-translate/service/fl-translate.service';


/**
 * Factory to create a spreadsheet
 */
export class FlSpreadsheetFactory {

  /**
   * Create a spreadsheet from a JSON csv.
   * Each key is the column name and it contains the list of column values
   */
  public static fromCsvJson(values: ClCsvJson, sheetName: string): FlSheet {
    const sheet: FlSheet = new FlSheet(sheetName);


    let columnIndex: number = 0;
    // happen the header row
    sheet.appendMultipleRows(1);

    for (const columnName of Object.keys(values)) {
      sheet.appendMultipleColumns(1);
      sheet.setColumnValues(columnIndex, [columnName, ...values[columnName]]);

      columnIndex++;
    }
    return sheet;
  }

  /**
   * Create a spreadsheet from any object
   */
  public static fromAny(values: any, sheetName: string): FlSheet {
    let array: any[][];


    if (Array.isArray(values)) {
      array = FlSpreadsheetFactory.arrayToArray2d(values);
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
    sheet.appendMultipleRows(values.length);

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
   * It uses each attribute as column
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

  /**
   * Convert a simple array to 2d array
   * If this is an array of objects, it creates an array with object values for each object
   * @param array
   * @private
   */
  private static arrayToArray2d(array: any[]): any[][] {
    const array2d: any[][] = [];
    for (const value of array) {
      if (value == null) continue;

      if (Array.isArray(value)) {
        array2d.push(array2d);
        continue;
      }

      if (typeof value === 'object') {
        const subArray: any[] = [];
        for (const key of Object.keys(value)) {
          subArray.push(value[key]);
        }
        array2d.push(subArray);
        continue;
      }

      array2d.push([value]);
    }

    return array2d;
  }

  public static getSheetNameFromId(id: number): string {
    return FlTranslateService.getInstance().translate('flSpreadsheet.sheet') + ' ' + id;
  }
}
