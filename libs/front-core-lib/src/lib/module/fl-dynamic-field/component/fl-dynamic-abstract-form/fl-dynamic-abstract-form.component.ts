import {
  ChangeDetectionStrategy,
  Component,
  ComponentRef,
  Input,
  OnDestroy,
  OnInit,
  Type,
  ViewChild,
  ViewContainerRef
} from '@angular/core';
import {FlDynamicFormAbstractControl} from '../../model/fl-dynamic-field-config.class';
import {AbstractControl} from '@angular/forms';
import {FlDynamicFieldComponent} from '../fl-dynamic-field/fl-dynamic-field.component';
import {FlDynamicFormGroupComponent} from '../fl-dynamic-form-group/fl-dynamic-form-group.component';
import {FlDynamicFormArrayComponent} from '../fl-dynamic-form-array/fl-dynamic-form-array.component';
import {FlDynamicAbstractFormDirective} from '../../model/fl-dynamic-abstract-form.directive';

/**
 * Component to generate a FormGroup, FormArray or FormControl form base on config
 */
@Component({
  selector: 'fl-dynamic-abstract-form',
  templateUrl: './fl-dynamic-abstract-form.component.html',
  styleUrls: ['./fl-dynamic-abstract-form.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FlDynamicAbstractFormComponent implements OnInit, OnDestroy {

  @Input() config: FlDynamicFormAbstractControl;

  @Input() control: AbstractControl;

  @ViewChild('viewContainer', {static: true, read: ViewContainerRef}) viewContainer: ViewContainerRef;

  private viewComponentRef: ComponentRef<FlDynamicAbstractFormDirective>;


  constructor() {
  }

  ngOnInit(): void {
    this.viewComponentRef = this.viewContainer.createComponent(this.getComponentType());
    this.viewComponentRef.instance.config = this.config;
    this.viewComponentRef.instance.control = this.control;
  }

  private getComponentType(): Type<FlDynamicAbstractFormDirective> {
    switch (this.config.controlType) {
      case 'formControl':
        return FlDynamicFieldComponent;
      case 'formGroup':
        return FlDynamicFormGroupComponent;
      case 'formArray':
        return FlDynamicFormArrayComponent;
    }
  }

  ngOnDestroy(): void {
    this.viewComponentRef?.destroy();
  }


}
