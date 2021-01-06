import {BehaviorSubject, Observable} from 'rxjs';
import {map} from 'rxjs/operators';
import {HelpService} from '../../utils/help-service';
import {Datasource} from './datasource.class';

/**
 * Simple class to simplify array management (add update or delete item)
 *
 *  /!\ WARNING: call the disconnect method destroying the object to clear the observable
 */
export abstract class ArrayObs<T = any> implements Datasource<T> {

  private _array: T[] = [];

  public get array(): T[] {
    return this._array || [];
  }

  public set array(array: T[]) {
    this._array = [...array];
    this.arrayChange$.next(null);
  }

  // emit when the array has changed
  private arrayChange$: BehaviorSubject<null> = new BehaviorSubject(null);


  protected constructor(data?: T[] | Observable<T[]>) {
    this.initData(data);
  }

  private initData(data?: T[] | Observable<T[]>): void {
    if (data) {
      if (data instanceof Array) {
        this.array = data;
      } else if (data instanceof Observable) {
        data.subscribe(
          array => this.array = array
        );
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

    if (!order) {
      this.array.push(...items);
    } else {
      for (const it of items) {
        HelpService.insertIntoOrderedArray(it, this.array, order);
      }
    }

    if (items.length > 0) {
      this.arrayChange$.next(null);
    }
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

    for (const it of items) {
      const index = this.array.findIndex(v => this.equals(it, v));
      this.updateIndex(it, index);
    }

    if (items.length > 0) {
      this.arrayChange$.next(null);
    }
  }

  /**
   * Update an item in the list
   *
   * @param item new item
   * @param index index of the item
   */
  public updateIndex(item: T, index: number): void {
    this.updateIndexLocal(item, index);

    this.arrayChange$.next(null);
  }

  private updateIndexLocal(item: T, index: number): void {
    if (index >= 0 && index < this.array.length) {
      this.array[index] = item;
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

    for (const it of items) {
      const index = this.array.findIndex(v => this.equals(it, v));
      this.removeIndex(index);
    }

    this.arrayChange$.next(null);
  }

  /**
   * Remove an item from the list with index
   *
   * @param index to remove
   */
  public removeIndex(index: number): void {
    this.removeIndexLocal(index);

    this.arrayChange$.next(null);
  }

  // remove the index without emitting
  private removeIndexLocal(index: number): void {
    if (index >= 0 && index < this.array.length) {
      this.array.splice(index, 1);
    }
  }

  ////////////////// OTHER ////////////////////////
  private convertObjectOrArrayToArray(object: T | T[]): T[] {
    return HelpService.convertObjectOrArrayToArray(object);
  }

  /**
   * Returns a simple (not deep) copy of array
   */
  public clone(): T[] {
    return [...this.array];
  }

  /**
   * Subscribe to array changes
   */
  public connect(): Observable<T[]> {
    return this.arrayChange$.asObservable().pipe(
      map(() => this._array)
    );
  }

  /**
   * Clear observable
   */
  public disconnect(): void {
    this.arrayChange$.complete();
  }

  public isEmpty(): boolean {
    return this._array == null || this._array.length === 0;
  }

  /**
   * Clear the array
   */
  public clearArray(): void {
    this.array = [];
  }

}
