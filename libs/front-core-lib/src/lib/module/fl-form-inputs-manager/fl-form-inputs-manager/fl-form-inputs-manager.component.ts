import {Component, EventEmitter, Input, OnDestroy, OnInit, Optional, Output} from '@angular/core';
import {AbstractControl, FormGroupDirective, NgForm, UntypedFormControl, UntypedFormGroup} from '@angular/forms';
import {Subscription} from 'rxjs';
import {FlFormFilledInput, FlFormInputName, FlFormInputsManagerConfig} from '../fl-form-inputs-manager.class';
import {FlTranslateService} from '../../fl-translate/service/fl-translate.service';
import {FlFormHelper} from '../../../model/fl-form-helper';

/**
 * Component that works with form to display the list of form input not null in a chip list
 * with a possibility to clear the form control
 *
 * If placed under a form, it works automatically (works with NgModel and Reactive forms),
 * otherwise the formGp input is mandatory
 *
 * /!\ It doesn't support FormArray
 */
@Component({
  selector: 'fl-form-inputs-manager',
  templateUrl: './fl-form-inputs-manager.component.html',
  styleUrls: ['./fl-form-inputs-manager.component.scss']
})
export class FlFormInputsManagerComponent implements OnInit, OnDestroy {

  /**
   * FormGroup of the form. To be provided only if this component is not under the wanted form
   */
  @Input() formGp: UntypedFormGroup;

  /**
   * Default value use for translation. If not translate field is provided
   * for an object in the config, this value is used
   */
  @Input() translateByDefault: boolean = false;

  /**
   * Config for the name and group displayed in the chips
   */
  @Input() config?: FlFormInputsManagerConfig = {};

  /**
   * If true, the false values are considered as null and the chip will not be created
   */
  @Input() skipFalseBoolean : boolean = false;

  /**
   * Event called whenever the chip list is refreshed (on form value change)
   */
  @Output() chipListChange: EventEmitter<FlFormFilledInput[]> = new EventEmitter<FlFormFilledInput[]>();

  /**
   * Event called when a chip or multi chip are deleted.
   */
  @Output() chipDelete: EventEmitter<FlFormFilledInput[]> = new EventEmitter();


  filledInputs: FlFormFilledInput[] = [];

  private subscription: Subscription;

  constructor(@Optional() private ngForm: NgForm,
              @Optional() private formGroupDirective: FormGroupDirective,
              private translateService: FlTranslateService) {
  }

  ngOnInit(): void {
    // check input
    if ((this.ngForm == null || this.ngForm.control == null) &&
      this.formGroupDirective == null && this.formGp == null) {
      console.error('There is no control form associated');
      return;
    }

    // get the formGroup if it doesn't exist
    if (this.formGp == null) {
      // case of NgModel form
      if (this.ngForm) {
        this.formGp = this.ngForm.form;
      }
      // case of reactive form
      else if (this.formGroupDirective) {
        this.formGp = this.formGroupDirective.form;
      } else {
        return;
      }
    }

    this.subscription = this.formGp.valueChanges.subscribe(
      () => this.refreshChipList()
    );

    // call the refresh on start
    this.refreshChipList();
  }

  // function to refresh the chip list
  private refreshChipList(): void {
    this.filledInputs = [];

    const config = this.config || {};

    // loop through each control
    for (const key of Object.keys(this.formGp.controls)) {
      // check control value
      this.checkControlValue(key, this.formGp.get(key), config[key]);
    }

    this.emitChipListChange();
  }

  // check a control value to see if it's empty or not
  private checkControlValue(key: string, control: AbstractControl, config?: string | FlFormInputName | FlFormInputsManagerConfig): void {
    if (control == null) {
      return;
    }

    // if this is not a nested config
    if (typeof config === 'string' || (config != null && typeof config.name === 'string') || control instanceof UntypedFormControl) {

      // skip false boolean, consider them like null
      if (this.skipFalseBoolean && control.value === false) {
        return;
      }

      if (!FlFormHelper.isControlEmpty(control)) {
        this.filledInputs.push(this.getFilledInputName(key, control, config as any));
      }
    }
    // if this is a nested config
    else {
      // avoid null config
      config = config || {};
      // loop through nested control to check values
      for (const childKey of Object.keys((control as UntypedFormGroup).controls)) {
        // recursive call to check children
        this.checkControlValue(childKey, control.get(childKey), config[childKey]);
      }
    }
  }

  clearInput(formInput: FlFormFilledInput): void {
    // clear the form control value
    formInput.control.reset();

    this.emitChipDeleted([formInput]);
  }

  // return the name of the input with the config
  private getFilledInputName(key: string, control: AbstractControl,
                             config?: string | FlFormInputName): FlFormFilledInput {

    // get the translate bool
    let translate: boolean = this.translateByDefault;

    // if config has the translate attribute to override default
    if (config != null && (typeof config !== 'string') && config.translate != null) {
      translate = config.translate;
    }

    // get the name
    let name: string;
    if (config == null) {
      // if no config, take the key as the name
      name = key;
    } else if (typeof config === 'string') {
      // if the config is a string, this is the name
      name = config;
    } else {
      // if there is a name in the config object, use it
      name = config.name;
    }

    // translate if necessary
    if (translate) {
      name = this.translateService.translate(name);
    }

    return {
      key: key,
      name: name,
      control: control
    };
  }

  private emitChipListChange(): void {
    this.chipListChange.emit(this.filledInputs);
  }

  private emitChipDeleted(formInputs: FlFormFilledInput[]): void {
    this.chipDelete.emit(formInputs);
  }

  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
  }


}
