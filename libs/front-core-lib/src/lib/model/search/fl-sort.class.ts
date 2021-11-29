import {MatSort, MatSortHeader} from '@angular/material/sort';

/**
 * Direction for sorting element
 */
export type FlSortDirection = 'ASC' | 'DESC';

/**
 * Describe how to manage null data when sorting
 */
export type FlSortNullManagement = 'FIRST' | 'LAST';

/**
 * Criteria describing how to sort a set of data
 */
export interface FlSortCriteria {
  /**
   * Name of the column. Support '.' to go deeply in objects
   */
  key: string;

  /**
   * Sort direction
   */
  direction: FlSortDirection;

  /**
   * Null management
   */
  nullManagement: FlSortNullManagement;
}

/**
 * Static class that group method to simplify work with matSort
 */
export class FlMatSort {
  /**
   * Set the sort in a matSort programmatically
   * Code form https://github.com/angular/components/issues/10242
   */
  public static setSort(matSort: MatSort, id: string, direction: 'asc' | 'desc'): void {
    if (matSort == null) {
      return;
    }
    // reset state so that start is the first sort direction that you will see
    FlMatSort.resetSort(matSort);

    // call the real sort
    matSort.sort({
      id: id,
      start: direction,
      disableClear: false
    });
    // use to make the sort arrow appear
    (matSort.sortables.get(id) as MatSortHeader)?._setAnimationTransitionState({toState: 'active'});
  }

  public static resetSort(matSort: MatSort): void {
    if (matSort == null) {
      return;
    }
    // reset state so that start is the first sort direction that you will see
    matSort.sort({id: null, start: 'asc', disableClear: false});
  }

}




