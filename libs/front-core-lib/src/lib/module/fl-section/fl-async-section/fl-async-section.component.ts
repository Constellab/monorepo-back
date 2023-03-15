import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ContentChild,
  Input,
  OnDestroy,
  OnInit,
  TemplateRef
} from '@angular/core';
import {Observable, Subscription} from 'rxjs';
import {FlSectionBodyDirective} from '../fl-section-body';
import {ClHelpService} from '@monorepo/core-lib';
import {FlViewContext} from '../../../model/fl-view-context.class';
import {FlDatasource} from '../../../model/datasource/fl-datasource.class';
import {delay} from 'rxjs/operators';
import {FlServerError} from '../../fl-api/model/fl-server-error.class';
import {FlTranslateService} from '../../fl-translate/service/fl-translate.service';
import {FlStatusEvent} from '../../../model/fl-status-event.class';

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
    this.inputIsProvided = object != null;
    if (object == null) {
      return;
    }

    if (object instanceof Observable) {
      this.subscribeToObservable(object);
    } else {
      this.onSuccess(object);
    }
  }

  /**
   * If an array obs is provided, it disconnect it on destroy
   */
  @Input() set arrayObs(arrayObs: FlDatasource<T>) {
    this.inputIsProvided = arrayObs != null;
    if (arrayObs == null) {
      return;
    }

    if (arrayObs) {
      this.subscribeToObservable(arrayObs.connect());
    }
    this._arrayObs = arrayObs;
  }

  private _arrayObs: FlDatasource<any>;

  /**
   * Show if the observable return an empty object or an error and error text is not defined
   * The text is translated
   */
  @Input() emptyText: string = 'object_not_found';

  /**
   * Show if the observable end up in error and the errorText is defined
   * The text is translated
   */
  @Input() errorText: string = null;


  /**
   * If true, the null, undefined or empty array result is considered as a valid value
   * and the body will be lazy loaded
   */
  @Input() nullOrEmptyIsValid: boolean = false;

  /**
   * If true and an error happens, the error is show in the html
   */
  @Input() showServerErrorText: boolean = false;

  /**
   * If true, the provided observable is a FlStatusEvent observable.
   * The FlStatusEvent is used to manage the success, loading and error state of the section.
   */
  @Input() isFlStatusEvent: boolean = false;

  /** Content that will be rendered lazily. */
  @ContentChild(FlSectionBodyDirective, {read: TemplateRef, static: true}) lazyContent: TemplateRef<any>;

  inputIsProvided: boolean = false;

  // when true, the body is lazy loaded
  showBody: boolean = false;

  infoText: string;

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
    this.subscription = observable.pipe(delay(0)).subscribe({
      next: result => this.onResponse(result),
      error: error => this.onError(error)
    });
  }

  private onResponse(result: any): void {
    if (this.isFlStatusEvent) {
      this.onStatusEvent(result as FlStatusEvent);
      return;
    }

    this.onSuccess(result);
  }

  private onSuccess(result: any): void {
    this.isLoading = false;
    this.result = result;
    this.setInfoText(false);

    // show the result if it's not null of we consider null as a valid value
    this.showBody = this.nullOrEmptyIsValid || !ClHelpService.isNullOrEmpty(this.result);

    this.cdr.detectChanges();
  }

  private onError(error: FlServerError): void {
    this.isLoading = false;
    this.showBody = false;

    // show error text if input is set and the error is a FlServerError
    if (this.showServerErrorText && error?.message) {
      this.infoText = error.message;
    } else {
      // otherwise, show the empty text
      this.setInfoText(true);
    }
    this.cdr.detectChanges();
  }

  private onStatusEvent(event: FlStatusEvent): void {
    if (event.status === 'success') {
      this.onSuccess(event.object);
    } else if (event.status === 'error') {
      this.onError(event.error);
    }
  }

  private setInfoText(error: boolean): void {
    if (error && this.errorText != null) {
      this.infoText = this.translateService.translate(this.errorText);
    } else {
      if (ClHelpService.isNullOrEmpty(this.emptyText)) {
        this.infoText = '';
      } else {
        this.infoText = this.translateService.translate(this.emptyText);
      }
    }
  }


  get viewContext(): FlViewContext<any> {
    return {$implicit: this.result};
  }


  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
    this._arrayObs?.disconnect();
  }


}
