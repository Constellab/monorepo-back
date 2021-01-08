import {FlArrayObs} from './fl-array-obs.class';
import {FlGetPageFunction, FlPage} from '../fl-page.class';

/**
 * Datasource that work with a method that returns paginated results.
 */
export abstract class FlDatasourcePaginated<T> extends FlArrayObs<T> {

  // current page number
  private pageNumber: number = 0;

  /**
   * Current page information
   */
  public page ?: FlPage<T>;

  // true when a request is being made
  public isLoading: boolean = false;
  // true when a new get page request is running
  public firstPageIsLoading: boolean = false;
  // true when next page is loading
  public nextPageIsLoading: boolean = false;

  // when the datasource it prevent all call to be made event if a filter of function are called
  private disabled: boolean = false;

  protected constructor(private getPageFunction: FlGetPageFunction<T>, private pageSize: number, initFirstPage: boolean = true) {
    super();
    if (initFirstPage) {
      this.getFirstPage();
    }
  }

  disconnect(): void {
    this.clearObservables();
  }

  /**
   * Call a the getPage method for the first page
   */
  public getFirstPage(): void {
    if (this.disabled) {
      return;
    }

    this.pageNumber = 0;
    this.page = null;
    this.firstPageIsLoading = true;

    if (!this.isEmpty()) {
      this.clearArray();
    }
    this.callGetPageFunction();
  }

  /**
   * Call the getPage method with the same previous parameters for the next page
   */
  public getNextPage(): void {
    if (this.disabled) {
      return;
    }

    if (!this.isLoading) {
      this.pageNumber++;
      this.nextPageIsLoading = true;
      this.callGetPageFunction();
    }
  }

  private callGetPageFunction(): void {
    this.isLoading = true;
    this.getPageFunction(this.pageNumber, this.pageSize).subscribe(
      result => this.onSuccess(result),
      () => this.error()
    );
  }

  // add results to current array and save page
  private onSuccess(result: FlPage<T>): void {
    this.page = result;
    this.clearAfterCall();

    if (result.first) {
      this.array = result.objects;
    } else {
      this.addItem(result.objects);
    }
  }

  // revert pageNumber and clear loaders
  private error(): void {
    if (this.pageNumber > 0) {
      this.pageNumber--;
    }
    this.clearAfterCall();
  }

  // clear loadings and subscriptions
  private clearAfterCall(): void {
    this.isLoading = false;
    this.nextPageIsLoading = false;
    this.firstPageIsLoading = false;
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

}
