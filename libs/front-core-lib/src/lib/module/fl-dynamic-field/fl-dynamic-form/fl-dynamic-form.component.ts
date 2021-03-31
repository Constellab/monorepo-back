import {Component, Input, OnInit} from '@angular/core';
import {FormControl, FormGroup, Validators} from '@angular/forms';
import {FlDynamicFormFieldConfig} from '../fl-dynamic-field-config.class';

/**
 * Component to create dynamic form based on {@link FlDynamicFieldComponent}
 */
@Component({
  selector: 'fl-dynamic-form',
  templateUrl: './fl-dynamic-form.component.html',
  styleUrls: ['./fl-dynamic-form.component.scss']
})
export class FlDynamicFormComponent implements OnInit {

  /**
   * Form where control will be added
   */
  @Input() formGp: FormGroup;

  @Input() configs: FlDynamicFormFieldConfig[];

  constructor() {
  }

  ngOnInit(): void {
    this.initForm();
  }

  private initForm(): void {
    for (const config of this.configs) {
      const control: FormControl = new FormControl({
        value: config.initValue,
        disabled: config.disabled === true
      });

      if(config.required){
        control.setValidators(Validators.required);
      }

      this.formGp.addControl(config.controlName, control);
    }
  }

}
