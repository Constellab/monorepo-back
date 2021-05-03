import {ControlValueAccessor, NgControl} from '@angular/forms';
import {Directive, Input} from '@angular/core';
import {AbstractControl} from '@ngneat/reactive-forms';
import {ValidationErrors} from '@ngneat/reactive-forms/lib/types';
import {ClHelpService} from '@monorepo/core-lib';

/**
 * Class to be extended by component that supports NgModel
 *
 * It provide simplification for NgModel methods, required and disable inputs
 *
 * This can work with {@link FlFormFieldComponent} is the LibFormFieldDirective is provided by the extend class
 * Example --> providers: [{provide: LibFormFieldDirective, useExisting: LibColorSelectorComponent}]
 * If the provider is set the error attribute will be filled
 *
 * <INNER> type is the type used within the component
 * <OUTER> type is the type set and received by the model
 * By default INNER = OUTER and no need to override convert methods.
 */
@Directive()
export abstract class FlFormFieldDirective<INNER, OUTER = INNER> implements ControlValueAccessor {

  protected _value: INNER;

  get value(): INNER {
    return this._value;
  }


  // set the value or array
  set value(value: INNER) {
    this._value = value;
  }

  /**
   * If true, the field is in a error state, the component can show error colors
   */
  error: boolean;

  /**
   * Control of the form
   */
  ngControl: NgControl;

  /** Whether the input is disable */
  private _disabled: boolean = false;

  /** Whether filling out the input is required in the form. */
  private _required: boolean = false;

  /**
   * Disabled the input
   */
  get disabled(): boolean {
    return this._disabled;
  }

  /**
   * Disabled the input
   */
  @Input() set disabled(isDisabled: boolean) {
    this.setDisabledState(isDisabled);
  }

  /**
   * Whether filling out the input is required in the form
   */
  get required(): boolean {
    return this._required;
  }


  /**
   * Whether filling out the input is required in the form
   */
  @Input()
  set required(value: boolean) {
    this._required = ClHelpService.coerceBooleanOrEmptyProperty(value);
  }

  /**
   *
   * @param ngControl control for ControlValueAccessor
   * @protected
   */
  protected constructor(ngControl: NgControl) {
    // Replace the provider from above with this.
    if (ngControl != null) {
      // Setting the value accessor directly (instead of using
      // the providers) to avoid running into a circular import.
      ngControl.valueAccessor = this;
      this.ngControl = ngControl;
    }
  }

  /**
   * register the validate method to be called by the angular validator
   * @protected
   */
  protected registerValidateMethod(): void {
    this.ngControl.control.setValidators([this.validate.bind(this)]);
  }


  private onChange: (_: OUTER) => void = () => {
    // tslint:disable-next-line
  };

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  markAsTouched: () => void = () => {
    // tslint:disable-next-line
  };

  registerOnTouched(fn: any): void {
    this.markAsTouched = fn;
  }

  abstract writeValue(obj: OUTER): void;

  setDisabledState(isDisabled: boolean): void {
    this._disabled = ClHelpService.coerceBooleanOrEmptyProperty(isDisabled);
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  validate(control: AbstractControl<OUTER>): ValidationErrors | null {
    return null;
  }

  /**
   * Set the component error state. This is automatically call by the {@link FlFormFieldComponent}
   * if this component is wrap in a LibFormFieldComponent and the LibFormFieldDirective is provided in this component
   * @param isError bool
   */
  setErrorState(isError: boolean): void {
    this.error = isError;
  }

  protected setAndEmitValue(value: INNER): void {
    this.value = value;
    this.emitCurrentValue();
  }

  protected emitCurrentValue(): void {
    const outerValue = this.convertInnerToOuter(this.value);
    this.onChange(outerValue);
    this.callChangeEvent(outerValue);
  }

  /**
   * Method called after value emission in order to call the
   * change EventEmitter
   * @param value value to emit in change
   */
  abstract callChangeEvent(value: OUTER): void;


  /**
   * Method to be extended (if INNER !== OUTER) to convert the outer value to inner value
   * used when receiving the value for the model.
   *
   * Call this method in writeValue
   */
  protected convertOuterToInner(outerValue: OUTER): INNER {
    return outerValue as any;
  }

  /**
   * Method to be extended (if INNER !== OUTER) to convert the inner value to outer value
   * before sending the value to model
   *
   * This method is called when emitting a value
   */
  protected convertInnerToOuter(innerValue: INNER): OUTER {
    return innerValue as any;
  }


}
