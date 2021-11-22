import {Component, Input, OnInit, ViewChild} from '@angular/core';
import {FlDynamicFormGroupConfig, FlDynamicFormHelper} from '@monorepo/front-core-lib';
import {BioxConfigData} from '../../../../model/entities/biox-config.entity';
import {MatExpansionPanel} from '@angular/material/expansion';
import {FormGroup} from '@angular/forms';

export interface BioxConfigValue {
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

  @Input() formGp: FormGroup;

  @ViewChild(MatExpansionPanel) expansion: MatExpansionPanel;

  publicFormGp: FormGroup;
  protectedFormGp: FormGroup;

  publicConfig: FlDynamicFormGroupConfig;
  protectedConfig: FlDynamicFormGroupConfig;

  showProtectedConfigs: boolean = false;
  protectedConfigExpand: boolean = false;

  constructor() {
  }

  ngOnInit(): void {
    this.publicConfig = this.bioxConfigData.getDynamicFormFieldsConfig('public');
    this.protectedConfig = this.bioxConfigData.getDynamicFormFieldsConfig('protected');

    const value = this.bioxConfigData.mergeConfigWithDefault();
    this.publicFormGp = FlDynamicFormHelper.generateFormGroup(this.publicConfig, value);
    this.protectedFormGp = FlDynamicFormHelper.generateFormGroup(this.protectedConfig, value);
    this.formGp.addControl('public', this.publicFormGp);
    this.formGp.addControl('protected', this.protectedFormGp);

    this.showProtectedConfigs = this.bioxConfigData.hasConfig('protected');
    // Automatically expand the advanced config if there is no public config
    this.protectedConfigExpand = !this.bioxConfigData.hasConfig('public');
  }
}
