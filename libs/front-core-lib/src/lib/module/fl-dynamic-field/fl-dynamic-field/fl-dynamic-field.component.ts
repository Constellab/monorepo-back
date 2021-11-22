import {ChangeDetectionStrategy, Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {
  FlDynamicFieldConfig,
  FlDynamicFieldConfigInput,
  FlDynamicFieldConfigMaterialInput,
  FlDynamicFieldConfigSelect
} from '../fl-dynamic-field-config.class';
import {FormControl} from '@angular/forms';
import {FlDynamicAbstractFormDirective} from '../fl-dynamic-abstract-form.directive';

/**
 * NgModel component to generate a form field dynamically based on a config
 */
@Component({
  selector: 'fl-dynamic-field',
  templateUrl: './fl-dynamic-field.component.html',
  styleUrls: ['./fl-dynamic-field.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FlDynamicFieldComponent implements OnInit, FlDynamicAbstractFormDirective {

  @Input() config: FlDynamicFieldConfig;

  @Input() control: FormControl;

  @Output() valueChange: EventEmitter<any> = new EventEmitter<any>();

  required: boolean = false;


  ngOnInit(): void {
    this.required = !!this.config.required;
  }

  // getter to avoid error in HTML
  get inputConfig(): FlDynamicFieldConfigInput {
    return this.config as FlDynamicFieldConfigInput;
  }

  // getter to avoid error in HTML
  get materialConfig(): FlDynamicFieldConfigMaterialInput {
    return this.config as FlDynamicFieldConfigMaterialInput;
  }

  get selectConfig(): FlDynamicFieldConfigSelect {
    return this.config as FlDynamicFieldConfigSelect;
  }
}
