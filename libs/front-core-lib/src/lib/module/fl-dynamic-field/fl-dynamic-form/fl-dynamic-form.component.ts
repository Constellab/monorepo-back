import {Component, Input, OnInit} from '@angular/core';
import {FormControl, FormGroup} from '@angular/forms';
import {FlDynamicFormFieldConfig} from '@monorepo/front-core-lib';

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
      this.formGp.addControl(config.controlName, new FormControl({
          value: config.initValue,
          disabled: config.disabled === true
        })
      );
    }
  }

}
