import {AfterViewInit, Directive, QueryList, ViewChildren} from '@angular/core';
import { MatAutocomplete } from '@angular/material/autocomplete';
import { MatOption } from '@angular/material/core';
import { MatSelect } from '@angular/material/select';

import {ClHelpService} from '@monorepo/core-lib';

/**
 * Class to be extended by components with embedded <mat-option>
 * This class allow a child component with <mat-option> to register the options
 * to the parent <mat-select> or <mat-autocomplete>
 *
 * The method registerSelectOptions register the <mat-option>
 * in the component to the <mat-select> or <mat-autocomplete> parent
 *
 * /!\ WARNING the method initOptions must be called during AfterViewInit cycle to make it works
 */
@Directive()
export abstract class FlEmbeddedOptionsAbstractDirective implements AfterViewInit {

  @ViewChildren(MatOption) protected options: QueryList<MatOption>;

  protected constructor(private optionParent: MatSelect | MatAutocomplete) {
    if (optionParent == null) {
      console.error('The component must be a child of a mat-select or a mat-autocomplete');
    }
  }

  /**
   * Implement this method to call the initOptions method
   *
   * This method must call the initOptions
   */
  abstract ngAfterViewInit(): void;


  /**
   * Call the init method to init the options
   * This method must be called on the AfterViewInit life cycle
   *
   * This method must be call only Once
   */
  protected initOptions(): void {
    // the observable is complete on destroy
    this.options.changes.subscribe(
      options => this.registerSelectOptions(this.optionParent, options),
    );
    this.registerSelectOptions(this.optionParent, this.options);
  }

  /**
   * This method can be called to manually register options
   * @param select MatSelect instance
   * @param options options to add
   */
  protected registerSelectOptions(select: MatSelect | MatAutocomplete, options: QueryList<MatOption>): void {
    select.options.reset([
        ...select.options.toArray(),
        ...options.toArray()
      ]
    );
    select.options.notifyOnChanges();
  }


  ////////////// METHOD FOR MAT-SELECT /////////////////////////

  /**
   * Select one or multiple option in the select
   * @param select mat select instance
   * @param value value to select
   * @param override if false, it only select the value if the select value is null
   */
  protected selectOption(select: MatSelect, value: any | any[], override: boolean = false): void {
    // the timeout is a security to let the option be ready
    setTimeout(() => {
      // check if we can write the value
      if (!override && !ClHelpService.isNullOrEmpty(select.selected)) {
        return;
      }

      // clear the current selection
      if (override) {
        select.writeValue(null);
      }

      const values = ClHelpService.convertObjectOrArrayToArray(value);

      // search and select the values
      for (const val of values) {
        // find the option with the compareWith method
        const option: MatOption = select.options.toArray()
          .find(opt => select.compareWith(opt.value, val));

        // if the options exist, call the select method on it
        if (option) {
          option.select();
        }
      }
    }, 0);
  }

  /**
   * Override the select compareWith
   * @param select mat select instance
   * @param compareWith method
   */
  protected overrideCompareWith(select: MatSelect, compareWith: (o1: any, o2: any) => boolean): void {
    select.compareWith = compareWith;
  }

  /**
   * Override the select compareWith with the default compareWith on ids
   * @param select mat select instance
   */
  protected overrideCompareWithOnIds(select: MatSelect): void {
    select.compareWith = ClHelpService.compareFnIds;
  }
}
