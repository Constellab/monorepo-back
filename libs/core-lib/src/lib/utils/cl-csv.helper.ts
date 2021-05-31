export interface ClCSVDelimiter {
  delimiter: string;
  name: string; // name of the delimiter
}

/**
 * List of know CSV delimiter
 */
export const clCSVDelimiters: ClCSVDelimiter[] = [
  {delimiter: ',', name: ','},
  {delimiter: ';', name: ';'},
  {delimiter: '\t', name: 'Tab'},
];

/**
 * Separator of lines for a CSV
 */
export const clCSVLineSeparator: string = '\n';

/**
 * Static class containing method to work with CSV strings
 */
export class ClCSVHelper {


  /**
   * Automatically detect the delimiter of a csv by counting possible delimiter from the first 10000 characters
   * @param csv
   */
  public static detectDelimiter(csv: string): ClCSVDelimiter {
    if (csv == null || csv.length === 0) {
      return null;
    }

    let maxDelimiter: ClCSVDelimiter;
    let maxDelimiterCount: number = 0;

    // use a sub csv to improve speed
    const subCsv = csv.substr(0, 10000);

    for (const delimiter of clCSVDelimiters) {
      const count: number = (subCsv.match(new RegExp(delimiter.delimiter, 'g')) ?? []).length;

      if (count > maxDelimiterCount) {
        maxDelimiter = delimiter;
        maxDelimiterCount = count;
      }
    }

    return maxDelimiter;
  }


}
