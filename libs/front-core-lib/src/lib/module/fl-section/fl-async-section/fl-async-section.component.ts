import {ChangeDetectionStrategy, ChangeDetectorRef, Component, ContentChild, Input, OnDestroy, OnInit, TemplateRef} from '@angular/core';
import {Observable, Subscription} from 'rxjs';
import {FlSectionBodyDirective} from '../fl-section-body';
import {ClHelpService} from '@monorepo/core-lib';
import {FlViewContext} from '../../../model/fl-view-context.class';
import {FlDatasource} from '../../../model/datasource/fl-datasource.class';
import {delay} from 'rxjs/operators';
import {FlServerError} from '../../fl-api/model/fl-server-error.class';
import {FlTranslateService} from '../../fl-translate/service/fl-translate.service';

@Component({
  selector: 'fl-async-section',
  templateUrl: './fl-async-section.component.html',
  styleUrls: ['./fl-async-section.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FlAsyncSectionComponent<T> implements OnInit, OnDestroy {

  /**
   * Provide an observable or a simple object (directly resolved)
   * @param object
   */
  @Input() set object(object: Observable<T> | Observable<T[]> | T) {
    if (object && object instanceof Observable) {
      this.subscribeToObservable(object);
    } else {
      this.onSuccess(object);
    }
  }

  /**
   * If an array obs is provided, it disconnect it on destroy
   */
  @Input() set arrayObs(arrayObs: FlDatasource<T>) {
    if (arrayObs) {
      this.subscribeToObservable(arrayObs.connect());
    }
    this._arrayObs = arrayObs;
  }

  private _arrayObs: FlDatasource<any>;

  @Input() emptyText: string = 'object_not_found';

  /**
   * If true, the null, undefined or empty array result is considered as a valid value
   * and the body will be lazy loaded
   */
  @Input() nullOrEmptyIsValid: boolean = false;

  /**
   * If true and an error happens, the error is show in the html
   */
  @Input() showErrorText: boolean = false;

  /** Content that will be rendered lazily. */
  @ContentChild(FlSectionBodyDirective, {read: TemplateRef, static: true}) lazyContent: TemplateRef<any>;

  // when true, the body is lazy loaded
  showBody: boolean = false;

  errorText: string;

  private result: any;
  isLoading: boolean = false;

  private subscription: Subscription;

  constructor(private cdr: ChangeDetectorRef,
              private translateService: FlTranslateService) {
  }

  ngOnInit(): void {
  }

  private subscribeToObservable(observable: Observable<any>): void {
    this.isLoading = true;

    // clear previous subscription if it exists
    this.subscription?.unsubscribe();

    // the delay is useful to init other input before call success or error method
    // because this method is call before ngOnInit
    this.subscription = observable.pipe(delay(0)).subscribe(
      result => this.onSuccess(result),
      error => this.onError(error)
    );
  }

  private onSuccess(result: any): void {
    this.isLoading = false;
    this.result = result;
    this.errorText = null;

    // show the result if it not null of we consider null as a valid value
    this.showBody = this.nullOrEmptyIsValid || !ClHelpService.isNullOrEmpty(this.result);

    this.cdr.detectChanges();
  }

  private onError(error: FlServerError): void {
    this.isLoading = false;
    this.showBody = false;

    // show error text if input is set and the error is a FlServerError
    if (this.showErrorText && error?.logDetail?.message) {
      this.errorText = error.logDetail.message;
    } else {
      // otherwise show the empty text
      this.errorText = this.translateService.translate(this.emptyText);
    }
    this.cdr.detectChanges();
  }

  get viewContext(): FlViewContext<any> {
    return {$implicit: this.result};
  }


  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
    this._arrayObs?.disconnect();
  }


}
