import {ChangeDetectionStrategy, Component, Input, OnInit} from '@angular/core';
import {UntypedFormArray} from '@angular/forms';
import {FlDynamicFormArrayConfig} from '../../model/fl-dynamic-field-config.class';
import {FlDynamicFormHelper} from '../../model/fl-dynamic-form-helper.class';
import {FlDynamicAbstractFormDirective} from '../../model/fl-dynamic-abstract-form.directive';
import {FlTranslateService} from '../../../fl-translate/service/fl-translate.service';
import {ClHelpService} from '@monorepo/core-lib';

@Component({
  selector: 'fl-dynamic-form-array',
  templateUrl: './fl-dynamic-form-array.component.html',
  styleUrls: ['./fl-dynamic-form-array.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FlDynamicFormArrayComponent implements OnInit, FlDynamicAbstractFormDirective {

  @Input() control: UntypedFormArray;

  @Input() config: FlDynamicFormArrayConfig;


  constructor(private translateService: FlTranslateService) {
  }

  ngOnInit(): void {
  }

  addGroup(): void {
    FlDynamicFormHelper.addFormGroupToFormArray(this.control, this.config,
      ClHelpService.deepClone(this.config.newElementDefaultValue));
  }

  removeGroup(index: number): void {
    this.control.removeAt(index);
  }

  hasValue(): boolean {
    return this.control.length > 0;
  }

  get disableAdd(): boolean {
    return this.config.maxSize != null && this.control.length >= this.config.maxSize;
  }

  get disableRemove(): boolean {
    return this.config.minSize != null && this.control.length <= this.config.minSize;
  }

  get addTooltip(): string {
    return this.disableAdd ?
      this.translateService.translate('flDynamicField.form_array_add_disable', {param: {value: this.config.maxSize}})
      : this.translateService.translate('flDynamicField.add_value_in_array');
  }

  get removeTooltip(): string {
    return this.disableRemove ?
      this.translateService.translate('flDynamicField.form_array_delete_disable', {param: {value: this.config.minSize}})
      : this.translateService.translate('flDynamicField.remove_value_from_array');
  }

}
