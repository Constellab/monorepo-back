/**
 * Helper class for CSV operations
 */
export class BlCsvHelper {
  public static toCsv<T>(data: T[], fields: (keyof T)[]): string {
    let csv = fields.join(',') + '\n';

    data.forEach((row: T) => {
      fields.forEach((field: keyof T) => {
        csv += `${String(row[field])},`;
      });
      csv += '\n';
    });

    return csv;
  }
}
