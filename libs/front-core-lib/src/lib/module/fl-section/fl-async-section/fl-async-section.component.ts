import {ChangeDetectionStrategy, ChangeDetectorRef, Component, ContentChild, Input, OnDestroy, OnInit, TemplateRef} from '@angular/core';
import {Observable, Subscription} from 'rxjs';
import {FlSectionBodyDirective} from '../fl-section-body';
import {ClHelpService} from '@monorepo/core-lib';
import {FlViewContext} from '../../../model/fl-view-context.class';
import {FlArrayObs} from '../../../model/datasource/fl-array-obs.class';

@Component({
  selector: 'fl-async-section',
  templateUrl: './fl-async-section.component.html',
  styleUrls: ['./fl-async-section.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FlAsyncSectionComponent implements OnInit, OnDestroy {
  @Input() observable: Observable<any>;

  /**
   * If an array obs is provided, it disconnect it on destroy
   */
  @Input() arrayObs: FlArrayObs;

  @Input() emptyText: string = 'object_not_found';

  /**
   * If true, the null, undefined or empty array result is considered as a valid value
   * and the body will be lazy loaded
   */
  @Input() nullOrEmptyIsValid: boolean = false;

  /** Content that will be rendered lazily. */
  @ContentChild(FlSectionBodyDirective, {read: TemplateRef, static: true}) lazyContent: TemplateRef<any>;

  // when true, the body is lazy loaded
  showBody: boolean = false;

  result: any;
  isLoading: boolean = false;

  subscription: Subscription;

  constructor(private cdr: ChangeDetectorRef) {
  }

  ngOnInit(): void {
    this.subscribeToObservable();
  }

  private subscribeToObservable(): void {
    this.isLoading = true;

    let obs: Observable<any>;
    if (this.observable) {
      obs = this.observable;
    } else if (this.arrayObs) {
      // if this is a datasource, skip the first because it returns an empty array
      obs = this.arrayObs.connect();
    } else {
      console.error('Not observable provided');
      return;
    }

    this.subscription = obs.subscribe(
      result => this.onSuccess(result),
      () => this.onError()
    );
  }

  private onSuccess(result: any): void {
    this.isLoading = false;
    this.result = result;

    // show the result if it not null of we consider null as a valid value
    this.showBody = this.nullOrEmptyIsValid || !ClHelpService.isNullOrEmpty(this.result);

    this.cdr.detectChanges();
  }

  private onError(): void {
    this.isLoading = false;
    this.showBody = false;
    this.cdr.detectChanges();
  }

  get viewContext(): FlViewContext<any> {
    return {$implicit: this.result};
  }


  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
    this.arrayObs?.disconnect();
  }


}
