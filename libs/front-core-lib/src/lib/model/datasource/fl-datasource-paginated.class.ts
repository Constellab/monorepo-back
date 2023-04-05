import {FlArrayObs} from './fl-array-obs.class';
import {Observable} from 'rxjs';
import {filter} from 'rxjs/operators';
import {ClGetPageFunction, ClPageI} from '@monorepo/core-lib';

/**
 * Datasource that work with a method that returns paginated results.
 */
export abstract class FlDatasourcePaginated<T> extends FlArrayObs<T> {


  /**
   * Current page information
   */
  public page ?: ClPageI<T>;

  // true when a request is being made
  public isLoading: boolean = false;
  // true when a new get page request is running
  public firstPageIsLoading: boolean = false;
  // true when next page is loading
  public nextPageIsLoading: boolean = false;

  // changed to true after first loading
  private isReady: boolean = false;

  // when the datasource it prevents all call to be made event if a filter of function are called
  private disabled: boolean = false;

  // The request data is passed when calling the get page method
  private requestData: any;

  constructor(private getPageFunction: ClGetPageFunction<T>, private pageSize: number, initFirstPage: boolean = true) {
    super();
    if (initFirstPage) {
      this.getFirstPage();
    }
  }

  // don't emit until the datasource is ready
  connect(): Observable<T[]> {
    return super.connect().pipe(filter(() => this.isReady));
  }

  disconnect(): void {
    this.clearObservables();
  }

  /**
   * Call a the getPage method for the first page
   */
  public getFirstPage(requestData?: any): void {
    if (this.disabled) {
      return;
    }
    if (!this.isEmpty()) {
      this.clearArray();
    }

    this.page = null;
    this.firstPageIsLoading = true;
    this.setRequestData(requestData);

    this.callGetPageFunction(this.pageNumber);
  }

  // current page number
  get pageNumber(): number {
    return this.page ? this.page.currentPage : 0;
  }

  /**
   * Call the getPage method with the same previous parameters for the next page
   */
  public getNextPage(): void {
    if (this.disabled) {
      return;
    }

    if (!this.isLoading) {
      this.nextPageIsLoading = true;
      this.callGetPageFunction(this.pageNumber + 1);
    }
  }

  private callGetPageFunction(pageNumber: number): void {
    this.isLoading = true;
    this.getPageFunction(pageNumber, this.pageSize, this.requestData).subscribe(
      result => this.onSuccess(result),
      error => this.onError(error)
    );
  }

  // add results to current array and save page
  private onSuccess(result: ClPageI<T>): void {
    this.isReady = true;
    this.page = result;
    this.clearAfterCall();

    if (result.first) {
      this.array = result.objects;
    } else {
      this.addItem(result.objects);
    }
  }


  // revert pageNumber and clear loaders
  private onError(error: any): void {
    this.isReady = true;


    this.clearAfterCall();
    // emit the error status
    // if the page is the first one, close the observable
    const isFirstPage: boolean = this.pageNumber === 0;
    this.error(error, isFirstPage);
  }

  // clear loadings and subscriptions
  private clearAfterCall(): void {
    this.isLoading = false;
    this.nextPageIsLoading = false;
    this.firstPageIsLoading = false;
  }

  public setPageData(data: T[]): void {
    this.isReady = true;
    this.page = {
      first: true,
      last: true,
      currentPage: 0,
      objects: data,
      pageSize: data.length,
      totalElements: data.length,
      totalIsApproximate: false,
    };
    this.array = data;
  }

  ////////////////// OTHER ////////////////////////

  /**
   * Enable the datasource and trigger new page call
   */
  public enableAndCallNewPage(): void {
    this.enable();
    this.getFirstPage();
  }

  public enable(): void {
    this.disabled = false;
  }

  public isEmpty(): boolean {
    return this.page == null || this.page.totalElements === 0;
  }

  /**
   * Disable the datasource, current call is canceled and
   * future action won't call new page or next page
   */
  public disable(): void {
    this.disabled = true;
  }

  public isDisabled(): boolean {
    return this.disabled;
  }

  /**
   * Function to manually clear the observable if there is not mat-table or the disconnect
   * method as been disabled
   */
  public clearObservables(): void {
    super.disconnect();
  }


  /**
   * Set the request data. The request data is passed when calling the get page method
   * @param data
   */
  public setRequestData(data: any): void {
    this.requestData = data;
  }

}
