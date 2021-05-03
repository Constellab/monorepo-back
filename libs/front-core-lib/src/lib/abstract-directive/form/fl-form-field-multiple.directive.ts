import {Directive, Input} from '@angular/core';
import {FlFormFieldDirective} from './fl-form-field.directive';
import {ClHelpService} from '@monorepo/core-lib';

/**
 * Class to be extended by component that supports NgModel
 *
 * It provide simplification for NgModel methods, required and disable inputs and
 * support for multiple
 *
 * More information on LibFormFieldDirective
 */
@Directive()
export abstract class FlFormFieldMultipleDirective<T> extends FlFormFieldDirective<T | T[]> {

  /** Whether the input is in multiple mode. */
  private _multiple: boolean = false;

  get multiple(): boolean {
    return this._multiple;
  }

  @Input()
  set multiple(value: boolean) {
    this._multiple = ClHelpService.coerceBooleanOrEmptyProperty(value);
  }

  get value(): T | T[] {
    if (this.multiple) {
      return this._value;
    } else {
      return this._value[0];
    }
  }


  // set the value or array
  set value(value: T | T[]) {
    this.initValue();
    const values: T[] = this.convertToArray(value);

    if (value == null) {
      this._value = [];
    } else if (!this.multiple) {
      this._value[0] = values[0];
    } else {
      this._value = values;
    }
  }

  // add or replace value base on the multiple
  addOrReplaceValue(value: T | T[]): void {
    this.initValue();
    const values: T[] = this.convertToArray(value);
    if (!this.multiple) {
      this._value[0] = values[0];
    } else {
      (this._value as T[]).push(...values);
    }
  }

  clearValue(): void {
    this._value = [];
  }

  private convertToArray(value: T | T[]): T[] {
    if (value == null) {
      return [];
    } else if (value instanceof Array) {
      return value;
    } else {
      return [value];
    }
  }

  private initValue(): void {
    if (this._value == null) {
      this._value = [];
    }
  }
}
