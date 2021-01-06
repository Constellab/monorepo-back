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
import {SectionBodyDirective} from '../section-body';
import {HelpService} from '../../../utils/help-service';
import {ViewContext} from '../../../model/global/view-context.class';
import {skip} from 'rxjs/operators';
import {ArrayObs} from '../../../model/datasource/array-obs.class';

@Component({
  selector: 'gen-async-section',
  templateUrl: './async-section.component.html',
  styleUrls: ['./async-section.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AsyncSectionComponent implements OnInit, OnDestroy {
  @Input() observable: Observable<any>;

  /**
   * If an array obs is provided, it disconnect it on destroy
   */
  @Input() arrayObs: ArrayObs;

  @Input() emptyText: string = 'object_not_found';

  /** Content that will be rendered lazily. */
  @ContentChild(SectionBodyDirective, {read: TemplateRef, static: true}) lazyContent: TemplateRef<any>;

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
      obs = this.arrayObs.connect().pipe(skip(1));
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
    this.cdr.detectChanges();
  }

  private onError(): void {
    this.isLoading = false;
    this.cdr.detectChanges();
  }

  get viewContext(): ViewContext<any> {
    return {$implicit: this.result};
  }

  get objectIsNullOrEmpty(): boolean {
    return HelpService.isNullOrEmpty(this.result);
  }

  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
    this.arrayObs?.disconnect();
  }


}
