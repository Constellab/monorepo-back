import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ContentChild,
  DoCheck,
  ElementRef,
  Host,
  Input,
  OnDestroy,
  OnInit,
  Optional,
  Renderer2
} from '@angular/core';
import {FormGroupDirective, NgControl, NgForm} from '@angular/forms';
import {Observable, Subscription} from 'rxjs';
import {first} from 'rxjs/operators';
import {FlFormFieldDirective} from '../../../../abstract-directive/form/fl-form-field.directive';

/**
 * Component to wrap around a custom form field to handle form error status like mat-form-field
 *
 * The error is shown if the form field is in error and if it has been touched or the form submitted
 *
 * It can work with the {@link FlFormFieldDirective} to update the error state of the directive
 *
 * It also adds the 'core-form-field-invalid' class on the 'form-field' tag
 *
 */
@Component({
  selector: 'fl-form-field',
  templateUrl: './fl-form-field.component.html',
  styleUrls: ['./fl-form-field.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FlFormFieldComponent implements OnInit, DoCheck, OnDestroy {

  // mandatory to get the control of the content input
  @ContentChild(NgControl, {static: true}) control: NgControl;

  // optional, to work with LibFormFieldDirective and set its state
  @ContentChild(FlFormFieldDirective, {static: true}) libFormFieldDirective: FlFormFieldDirective<any>;

  /**
   * If true the predefined space for the mat-error is removed, when the mat-error will appear
   * it will make the component grow
   */
  @Input() removeErrorSpace: boolean = false;

  // true if the error has to be displayed
  showError: boolean = null;

  // true if the containing form was submitted
  submitted: boolean = false;

  subscription: Subscription;

  constructor(@Host() @Optional() private ngForm: NgForm,
              @Host() @Optional() private formGroupDirective: FormGroupDirective,
              private renderer: Renderer2,
              private elementRef: ElementRef,
              private cdr: ChangeDetectorRef) {
  }

  ngOnInit(): void {
    if (!this.control) {
      console.error('[LibFormFieldComponent] No content with NgControl found');
    }

    this.subscribeToFormSubmit();
  }

  // subscribe to form submission to show the error after submission
  private subscribeToFormSubmit(): void {
    let submitObservable: Observable<void>;
    if (this.ngForm) {
      submitObservable = this.ngForm.ngSubmit;
    } else if (this.formGroupDirective) {
      submitObservable = this.formGroupDirective.ngSubmit;
    }

    this.subscription = submitObservable?.pipe(
      first()).subscribe(
      () => this.submitted = true
    );
  }

  ngDoCheck(): void {
    if (this.control) {
      const error = this.control.errors != null && (this.submitted || this.control.touched);

      if (this.showError !== error) {
        this.showError = error;
        this.libFormFieldDirective?.setErrorState(error);
        this.updateClass(error);

        // manually trigger change detection
        // it avoid change detection on do check each time
        this.cdr.detectChanges();
      }
    }
  }

  /**
   * add or remove the 'core-form-field-invalid' class on the host element
   */
  private updateClass(error: boolean): void {
    if (error) {
      this.renderer.addClass(this.elementRef.nativeElement, 'core-form-field-invalid');
    } else {
      this.renderer.removeClass(this.elementRef.nativeElement, 'core-form-field-invalid');
    }

  }

  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
  }


}
