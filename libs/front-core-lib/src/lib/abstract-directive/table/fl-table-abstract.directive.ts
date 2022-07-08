import {Directive, Input} from '@angular/core';
import {FlDatasource} from '../../model/datasource/fl-datasource.class';

export type FlTableColumnStatic<T> = Extract<keyof T, string> | string;
export type FlTableColumn<T> = FlTableColumnStatic<T> | FlTableColumnDetail<T>;

// column information with the name of the column to translate
export interface FlTableColumnDetail<T> {
  // attribute name of the object
  accessor: Extract<keyof T, string>;
  // column name that is translated
  columnName: string;
}

/**
 * Abstract directive for the Table component
 * It supports dynamic columns in the HTML by providing the list of static column in the constructor
 */
@Directive()
export abstract class FlTableAbstractDirective<T> {

  @Input() datasource: FlDatasource<T>;

  // tslint:disable-next-line:variable-name
  _columns: string[];
  // store the column input without transformation
  _columnsInput: FlTableColumn<T>[];

  private columnsDetails: FlTableColumnDetail<T>[];

  // setter for columns to refresh the other columns attribute
  @Input() set columns(columns: FlTableColumn<T>[]) {
    this._columnsInput = columns;
    this._columns = columns.map(column => this.extractColumnName(column));
    this.columnsDetails = columns.map(column => this.convertToColumnDetail(column))

    // update other columns
    this.calculateDynamicColumns();
  }

  // contains the list of columns name that are not statically defined in the
  // table HTML under matColumnDef
  dynamicColumns: FlTableColumnDetail<T>[] = [];

  /**
   * @param staticColumns list of columns name that are statically defined in the HTML in matColumnDef
   *                      all displayed columns not present in the static array will be referenced in the dynamic columns array
   *                      to generate dynamic column
   */
  protected constructor(protected staticColumns?: FlTableColumnStatic<T>[]) {
    this.calculateDynamicColumns();
  }

  /**
   * Defined dynamicColumns based on displayed columns and static columns
   */
  public calculateDynamicColumns(): void {
    if (this._columns && this.staticColumns) {
      const otherColumns: FlTableColumnDetail<T>[] = [];
      for (const column of this.columnsDetails) {
        // if the column is not in the static list, add it to the dynamic list
        if (this.staticColumns.indexOf(column.accessor) === -1) {
          otherColumns.push(column);
        }
      }

      this.dynamicColumns = otherColumns;
    }
  }

  private extractColumnName(column: FlTableColumn<T>): string {
    if (typeof column === 'object') {
      return column.accessor;
    } else {
      return column;
    }
  }

  private convertToColumnDetail(column: FlTableColumn<T>): FlTableColumnDetail<T> {
    if (typeof column === 'object') {
      return column;
    } else {
      return {
        accessor: column as any,
        columnName: column
      };
    }
  }

}
