import {Component, Input, OnInit} from '@angular/core';
import {FlDynamicFormGroupConfig, FlDynamicFormHelper} from '@monorepo/front-core-lib';
import {BioxConfigData} from '../../../../model/entities/biox-config.entity';
import {FormBuilder, FormGroup} from '@ngneat/reactive-forms';
import {ControlContainer} from '@angular/forms';

/**
 * form structure for the {@link BioxConfigureSpecsFormComponent}
 */
export interface BioxConfigureSpecsForm {
  public: Record<string, any>;
  protected: Record<string, any>;
}

/**
 * Use to create a form to create a configuration based on a spec {@link BioxConfigSpec}
 */
@Component({
  selector: 'gen-biox-configure-specs-form',
  templateUrl: './biox-configure-specs-form.component.html',
  styleUrls: ['./biox-configure-specs-form.component.scss']
})
export class BioxConfigureSpecsFormComponent implements OnInit {

  @Input() bioxConfigData: BioxConfigData;

  publicFormGp: FormGroup;
  protectedFormGp: FormGroup;

  publicConfig: FlDynamicFormGroupConfig;
  protectedConfig: FlDynamicFormGroupConfig;

  showProtectedConfigs: boolean = false;
  protectedConfigExpand: boolean = false;

  constructor(private controlContainer: ControlContainer) {
  }

  // build the form group to configure specs
  public static buildFormGroup(bioxConfigData: BioxConfigData): FormGroup<BioxConfigureSpecsForm> {
    const value = bioxConfigData.mergeConfigWithDefault();

    return new FormBuilder().group({
      public: FlDynamicFormHelper.generateFormGroup(bioxConfigData.getDynamicFormFieldsConfig('public'), value),
      protected: FlDynamicFormHelper.generateFormGroup(bioxConfigData.getDynamicFormFieldsConfig('protected'), value),
    });
  }

  ngOnInit(): void {
    this.publicConfig = this.bioxConfigData.getDynamicFormFieldsConfig('public');
    this.protectedConfig = this.bioxConfigData.getDynamicFormFieldsConfig('protected');
    this.publicFormGp = this.controlContainer.control.get('public') as any;
    this.protectedFormGp = this.controlContainer.control.get('protected') as any;


    this.showProtectedConfigs = this.bioxConfigData.hasConfig('protected');
    // Automatically expand the advanced config if there is no public config
    this.protectedConfigExpand = !this.bioxConfigData.hasConfig('public');
  }

}
