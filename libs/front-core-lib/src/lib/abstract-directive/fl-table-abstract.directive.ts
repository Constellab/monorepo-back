import {Directive, Input} from '@angular/core';
import {FlArrayObs} from '../model/datasource/fl-array-obs.class';

export type FlTableColumn<T> = keyof T | string;

/**
 * Abstract directive for the Table component
 * It  supports dynamic columns in the HTML by providing the list of static column in the constructor
 */
@Directive()
export abstract class FlTableAbstractDirective<T> {

  @Input() datasource: FlArrayObs<T>;

  // tslint:disable-next-line:variable-name
  _columns: FlTableColumn<T>[];

  // setter for columns to refresh the other columns attribute
  @Input() set columns(columns: FlTableColumn<T>[]) {
    this._columns = columns;

    // update other columns
    this.calculateDynamicColumns();
  }

  // contains the list of columns name that are not statically defined in the
  // table HTML under matColumnDef
  dynamicColumns: FlTableColumn<T>[] = [];

  /**
   * @param staticColumns list of columns name that are statically defined in the HTML in matColumnDef
   *                      all displayed columns not present in the static array will be referenced in the dynamic columns array
   *                      to generate dynamic column
   */
  protected constructor(protected staticColumns?: FlTableColumn<T>[]) {
    this.calculateDynamicColumns();
  }

  /**
   * Defined dynamicColumns based on displayed columns and static columns
   */
  public calculateDynamicColumns(): void {
    if (this._columns && this.staticColumns) {
      const otherColumns: FlTableColumn<T>[] = [];
      for (const column of this._columns) {
        // if the column is not in the static list, add it to the dynamic list
        if (this.staticColumns.indexOf(column) === -1) {
          otherColumns.push(column);
        }
      }

      this.dynamicColumns = otherColumns;
    }
  }

}
