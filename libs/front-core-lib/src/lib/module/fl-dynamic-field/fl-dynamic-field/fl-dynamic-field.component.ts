import {Component, EventEmitter, Input, OnInit, Optional, Output, Self} from '@angular/core';
import {FlDynamicFieldConfig} from '../fl-dynamic-field-config.class';
import {ControlValueAccessor, FormControl, NgControl, Validators} from '@angular/forms';
import {ClHelpService} from '@monorepo/core-lib';

/**
 * NgModel component to generate a form field dynamically based on a config
 */
@Component({
  selector: 'fl-dynamic-field',
  templateUrl: './fl-dynamic-field.component.html',
  styleUrls: ['./fl-dynamic-field.component.scss']
})
export class FlDynamicFieldComponent implements OnInit, ControlValueAccessor {

  @Input() config: FlDynamicFieldConfig;

  @Output() valueChange: EventEmitter<any> = new EventEmitter<any>();

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
    if (this.required) {
      this.formControl.setValidators(Validators.required);
    } else {
      this.formControl.clearValidators();
    }
    this.formControl.updateValueAndValidity();
  }

  formControl: FormControl = new FormControl();

  /**
   * Control of the form
   */
  ngControl: NgControl;

  constructor(@Optional() @Self() ngControl: NgControl) {
    // Replace the provider from above with this.
    if (ngControl != null) {
      // Setting the value accessor directly (instead of using
      // the providers) to avoid running into a circular import.
      ngControl.valueAccessor = this;
      this.ngControl = ngControl;
    }
  }

  ngOnInit(): void {
  }


  emitValue(value: any): void {
    this.onChange(value);
    this.callChangeEvent(value);
  }

  callChangeEvent(value: any): void {
    this.valueChange.emit(value);
  }

  writeValue(obj: any): void {
    this.formControl.patchValue(obj);
  }

  private onChange: (_: any) => void = () => {
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

  setDisabledState(isDisabled: boolean): void {
    this._disabled = ClHelpService.coerceBooleanOrEmptyProperty(isDisabled);
    if (this.disabled) {
      this.formControl.disable();
    } else {
      this.formControl.enable();
    }
  }


}
