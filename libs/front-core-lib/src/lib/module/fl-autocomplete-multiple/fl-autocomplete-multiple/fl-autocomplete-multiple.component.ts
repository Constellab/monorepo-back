import {Component, ElementRef, EventEmitter, Input, OnInit, Optional, Output, Self, ViewChild} from '@angular/core';
import {Observable, of} from 'rxjs';
import {FlFormFieldDirective} from '../../../abstract-directive/form/fl-form-field.directive';
import {NgControl} from '@angular/forms';
import {ENTER, TAB} from '@angular/cdk/keycodes';
import {MatLegacyInput as MatInput} from '@angular/material/legacy-input';
import {MatLegacyAutocompleteSelectedEvent as MatAutocompleteSelectedEvent} from '@angular/material/legacy-autocomplete';
import {MatLegacyChipInputEvent as MatChipInputEvent} from '@angular/material/legacy-chips';

@Component({
  selector: 'fl-autocomplete-multiple',
  templateUrl: './fl-autocomplete-multiple.component.html',
  styleUrls: ['./fl-autocomplete-multiple.component.scss']
})
export class FlAutocompleteMultipleComponent<T = any> extends FlFormFieldDirective<T[]> implements OnInit {

  @Input() placeholder: string;

  @Input() searchFunc: (formValue: string) => Observable<T[]>;

  /**
   * When true a new string value can be added event if it is not in the list of options
   * This works only if the values supports string
   */
  @Input() allowNewString: boolean = false;

  @Output() valueChange: EventEmitter<T[]> = new EventEmitter<T[]>();

  @ViewChild(MatInput, {read: ElementRef}) input: ElementRef<HTMLInputElement>;


  separatorKeysCodes: number[] = [ENTER, TAB];
  filteredOptions$: Observable<T[]>;

  constructor(@Optional() @Self() ngControl: NgControl) {
    super(ngControl);
  }

  ngOnInit(): void {
  }

  callChangeEvent(value: T[]): void {
    this.valueChange.next(value);
  }

  onDisableChange(disable: boolean): void {
  }

  writeValue(obj: T[]): void {
    if (!obj) {
      this.value = [];
    } else {
      this.value = obj;
    }
  }

  search(searchText: string): void {
    this.filteredOptions$ = this.searchFunc(searchText);
  }

  removeItem(index: number): void {
    this.value.splice(index, 1);
    this.emitCurrentValue();
  }

  // call when adding a tag without selecting an option
  addUnknownValue(event: MatChipInputEvent): void {
    if (!this.allowNewString) return;
    const value = (event.value || '').trim();

    if (!value) return;
    this.addItem(value as any);
  }

  optionSelected(event: MatAutocompleteSelectedEvent): void {
    this.addItem(event.option.viewValue as any);
  }

  private addItem(value: T): void {
    if (this.value == null) this.value = [];
    this.value.push(value);
    this.emitCurrentValue();
    this.input.nativeElement.value = '';
    this.filteredOptions$ = of([]);
  }

}
