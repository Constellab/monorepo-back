import {
  ChangeDetectionStrategy,
  Component,
  ComponentRef,
  Input,
  OnDestroy,
  OnInit,
  ViewChild,
  ViewContainerRef
} from '@angular/core';
import {FlDynamicFieldConfig} from '../../model/fl-dynamic-field-config.class';
import {UntypedFormControl} from '@angular/forms';
import {FlDynamicAbstractFormDirective} from '../../model/fl-dynamic-abstract-form.directive';
import {FlDynamicFieldAbstractDirective} from '../../model/fl-dynamic-field-abstract.directive';
import {FlDynamicFieldConfigService} from '../../model/fl-dynamic-field-config.service';

/**
 * NgModel component to generate a form field dynamically based on a config
 */
@Component({
  selector: 'fl-dynamic-field',
  templateUrl: './fl-dynamic-field.component.html',
  styleUrls: ['./fl-dynamic-field.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FlDynamicFieldComponent implements OnInit, OnDestroy, FlDynamicAbstractFormDirective {

  @Input() config: FlDynamicFieldConfig;

  @Input() control: UntypedFormControl;

  @ViewChild('viewContainer', {static: true, read: ViewContainerRef}) viewContainer: ViewContainerRef;

  private viewComponentRef: ComponentRef<FlDynamicFieldAbstractDirective>;

  constructor(private fieldConfig: FlDynamicFieldConfigService) {
  }

  ngOnInit(): void {
    this.viewComponentRef = this.fieldConfig.generateComponent(this.config,
      this.viewContainer, this.control);

  }

  ngOnDestroy(): void {
    this.viewComponentRef?.destroy();
  }


}
