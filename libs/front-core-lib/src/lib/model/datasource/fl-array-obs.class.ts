import {BehaviorSubject, Observable} from 'rxjs';
import {filter, map} from 'rxjs/operators';
import {FlDatasource} from './fl-datasource.class';
import {ClHelpService} from '@monorepo/core-lib';

/**
 * Status of the {@link FlArrayObs}
 */
export type FlArrayObsStatus = FlArrayObsStatusWaiting | FlArrayObsStatusSuccess
  | FlArrayObsStatusError | FlArrayObsStatusComplete;


export interface FlArrayObsStatusWaiting {
  status: 'waiting';
}

/**
 * Success status containing the last emitted value
 */
export interface FlArrayObsStatusSuccess<T = any> {
  status: 'success';
  result: T[];
}


export interface FlArrayObsStatusError<T = any> {
  status: 'error';
  error: T;
}

export interface FlArrayObsStatusComplete {
  status: 'complete';
}


/**
 * Simple class to simplify array management (add update or delete item)
 *
 *  /!\ WARNING: call the disconnect method destroying the object to clear the observable
 */
export abstract class FlArrayObs<T = any> implements FlDatasource<T> {

  // emit when the array has changed
  private array$: BehaviorSubject<T[]> = new BehaviorSubject(null);

  // last status of the array obs
  private status$: BehaviorSubject<FlArrayObsStatus> = new BehaviorSubject({status: 'waiting'});

  private filters: Record<string, (item: T) => boolean> = {};

  /**
   * @param data initial data
   * @param disableAutoDisconnect, if true the auto disconnect is disabled. mat-table and fl-async-section will
   * not automatically disconnect the array obs. It needs to be done manually (call manualDisconnect method)
   * @protected
   */
  protected constructor(data?: T[] | Observable<T[]>, private disableAutoDisconnect: boolean = false) {
    this.initData(data);
  }

  private initData(data?: T[] | Observable<T[]>): void {
    if (data) {
      if (data instanceof Array) {
        this.array = data;
      } else if (data instanceof Observable) {
        data.subscribe({
          next: array => this.array = array,
          error: error => this.error(error, true)
        });
      }
    }
  }

  /**
   * equals function used to check if two items are the same (for update or delete)
   */
  protected abstract equals(a: T, b: T): boolean;


  ////////////////// ADD ////////////////////////
  /**
   * Add an item to the array
   * @param item item or items to add
   * @param order if filled the item is added on the position when order returns < 0
   */
  public addItem(item: T | T[], order ?: (a: T, b: T, index: number) => boolean): void {
    const items: T[] = this.convertObjectOrArrayToArray(item);

    if (items.length === 0) {
      return;
    }

    const array: T[] = this.array;

    if (!order) {
      array.push(...items);
    } else {
      for (const it of items) {
        ClHelpService.insertIntoOrderedArray(it, array, order);
      }
    }

    this.array = array;
  }

  /**
   * Inserts new elements at the start of an array.
   * @param item item or items to add
   */
  public unshiftItem(item: T | T[]): void {
    this.addItem(item, () => true);
  }

  ////////////////// UPDATE ////////////////////////
  /**
   * Update an item in the list
   *
   * @param item updated item or items
   */
  public updateItem(item: T | T[]): void {
    const items: T[] = this.convertObjectOrArrayToArray(item);

    if (items.length === 0) {
      return;
    }

    const array: T[] = this.array;
    for (const item of items) {
      const index = array.findIndex(v => this.equals(item, v));
      array[index] = item;
    }

    this.array = array;
  }

  /**
   * Update an item in the list
   *
   * @param item new item
   * @param index index of the item
   */
  public updateIndex(item: T, index: number): void {
    const array: T[] = this.array;
    if (index >= 0 && index < array.length) {
      array[index] = item;

      this.array = array;
    }
  }


  ////////////////// REMOVE ////////////////////////
  /**
   * Remove an item from the list
   *
   * @param item item or items to remove
   */
  public removeItem(item: T | T[]): void {
    const items: T[] = this.convertObjectOrArrayToArray(item);

    if (items.length === 0) {
      return;
    }

    const array: T[] = this.array;

    for (const item of items) {
      const index = array.findIndex(v => this.equals(item, v));
      array.splice(index, 1);
    }

    this.array = array;
  }

  /**
   * Remove an item from the list with index
   *
   * @param index to remove
   */
  public removeIndex(index: number): void {
    const array: T[] = this.array;

    if (index >= 0 && index < array.length) {
      array.splice(index, 1);

      this.array = array;
    }
  }

  /////////////////////// ARRAY ////////////////////////
  // return a copy of the array
  public get array(): T[] {
    return this.array$.value?.slice() ?? [];
  }

  public set array(array: T[]) {
    this.array$.next(array);
    // update the status to success
    this.status = {status: 'success', result: array};
  }

  /**
   * Clear the array
   */
  public clearArray(): void {
    this.array = [];
  }


  ///////////////////////// STATUS ///////////////////////
  // return a copy of the array
  public get status(): FlArrayObsStatus {
    return this.status$.value;
  }

  public set status(status: FlArrayObsStatus) {
    this.status$.next(status);
  }

  /**
   * set the status as error
   * @param error
   * @param throwErrorInArray if true the error is thrown in the main array observable  (this will close the array observable)
   */
  public error(error: any, throwErrorInArray: boolean = false): void {
    this.status = {status: 'error', error: error};

    if (throwErrorInArray) {
      this.array$.error(error);
    }
  }

  public getStatus$(): Observable<FlArrayObsStatus> {
    return this.status$.asObservable();
  }

  /////////////////////// FILTERS ////////////////////////

  public addFilter(name: string, filter: (item: T) => boolean): void {
    this.filters[name] = filter;
    this.array$.next(this.array);
  }

  public removeFilter(name: string): void {
    delete this.filters[name];
    this.array$.next(this.array);
  }

  /////////////////////// OTHER ////////////////////////
  private convertObjectOrArrayToArray(object: T | T[]): T[] {
    return ClHelpService.convertObjectOrArrayToArray(object);
  }


  /**
   * Subscribe to array changes
   */
  public connect(): Observable<T[]> {
    return this.array$.asObservable().pipe(
      filter(array => array != null),
      // return a copy of the array
      map(array => {
        let newArray = array.slice();
        // apply filters
        for (const filter of Object.values(this.filters)) {
          newArray = newArray.filter(filter);
        }
        return newArray;
      })
    );
  }

  /**
   * Clear observable
   */
  public disconnect(): void {
    if (this.disableAutoDisconnect) return;
    this.manualDisconnect();
  }

  public manualDisconnect(): void {
    this.array$.complete();
    this.status = {status: 'complete'};
    this.status$.complete();
  }


  public isEmpty(): boolean {
    return this.array == null || this.array.length === 0;
  }


}
