import {Component, EventEmitter, Input, OnInit, Optional, Output, Self} from '@angular/core';
import {FlDynamicFieldConfig} from '../fl-dynamic-field-config.class';
import {ControlValueAccessor, FormControl, NgControl} from '@angular/forms';

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


}
