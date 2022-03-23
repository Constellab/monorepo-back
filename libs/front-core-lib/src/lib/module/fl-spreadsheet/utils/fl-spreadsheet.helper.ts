import {FlCellCoord, FlCellCoordRange} from '../model/fl-cell-coord.class';

const columnNames = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J',
  'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'];

export class FlSpreadsheetHelper {

  public static readonly coordSplitter: string = ':';
  public static readonly selectionsSplitter: string = ',';


  /**
   * Get the column name based on its index
   * get column name like A, B, C, AA, AB...
   * @param index
   */
  public static columnIndexToName(index: number): string {
    if (index === -1) {
      return '';
    }

    let name = '';
    const letterCount: number = columnNames.length;

    do {
      const rest: number = index % letterCount;
      name = columnNames[rest] + name;

      if (index >= letterCount) {
        index = ((index - rest) / letterCount) - 1;
      } else {
        break;
      }
    } while (index >= 0);

    return name;
  }

  /**
   * Get the column index based on its name (AA)
   * @param name
   */
  public static columnIndexFromName(name: string): number {
    const values = name.toUpperCase().split('').reverse();

    let index: number = 0;
    let exponent: number = 0;
    const letterCount: number = columnNames.length;


    for (const value of values) {
      index += this.getColumnLetterIndex(value) * (letterCount ** exponent);
      exponent++;
    }

    return index - 1;

  }

  // return the index in alphabet of a letter
  private static getColumnLetterIndex(letter: string): number {
    for (let i = 0; i < columnNames.length; i++) {
      if (columnNames[i] === letter) {
        return i + 1;
      }
    }
    return 0;
  }


  public static rowIndexToName(index: number): string {
    return (index + 1).toString();
  }

  public static rowIndexFromFrom(name: string): number {
    return parseInt(name) - 1;
  }


  public static coordToString(coord: FlCellCoord): string {
    return FlSpreadsheetHelper.columnIndexToName(coord.column) + FlSpreadsheetHelper.rowIndexToName(coord.row);
  }

  /**
   * convert a string coord like A2 or AA2 to FlCellCoord
   */
  public static coordFromString(coord: string): FlCellCoord {
    // find the position of the first digit
    const match: RegExpExecArray = /\d/.exec(coord);

    return {
      column: FlSpreadsheetHelper.columnIndexFromName(coord.substring(0, match.index)),
      row: FlSpreadsheetHelper.rowIndexFromFrom(coord.substring(match.index))
    };
  }

  public static coordRangeFromString(coordRange: string): FlCellCoordRange {
    const coords: string[] = coordRange.split(FlSpreadsheetHelper.coordSplitter);
    const from: FlCellCoord = FlSpreadsheetHelper.coordFromString(coords[0]);
    const to: FlCellCoord = FlSpreadsheetHelper.coordFromString(coords[1]);
    return {
      from: from,
      to: to
    };
  }

  ///////////////////////////// REGEX ////////////////////////////

  // get the string regex to match a coord (like A2)
  private static getStringRegexForCoord(): string {
    return '([a-z]|[A-Z])+(\\d)+';
  }

  // get the string regex to match single selection  (like A2:B3)
  private static getStringRegexForSingleSelection(): string {
    return this.getStringRegexForCoord() + FlSpreadsheetHelper.coordSplitter
      + this.getStringRegexForCoord();
  }

  // get the regex to match single selection  (like A2:B3)
  public static getRegexForSingleSelection(): RegExp {
    return new RegExp('^' + FlSpreadsheetHelper.getStringRegexForSingleSelection() + '$');
  }


  // get the regex to match multiple selections  (like A2:A4, B2:B4)
  public static getRegexForMultipleSelection(): RegExp {
    return new RegExp(
      `^(${this.getStringRegexForSingleSelection()})(,${this.getStringRegexForSingleSelection()})*$`
    );
  }
}

