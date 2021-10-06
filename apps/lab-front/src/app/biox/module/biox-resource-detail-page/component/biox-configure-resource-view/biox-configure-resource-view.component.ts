import {ChangeDetectionStrategy, Component, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {FormGroup} from '@ngneat/reactive-forms';
import {
  BioxResourceViewConfig,
  BioxResourceViewSpecWithConfig
} from '../../../../../core/model/entities/resource/biox-resource-view.entity';
import {FlDynamicFormFieldConfig} from '@monorepo/front-core-lib';

export interface BioxConfigureResourceViewInput {
  title: string;
  viewSpecConfig: BioxResourceViewSpecWithConfig;
}

/**
 * Dialog to configure resource view spec
 */
@Component({
  selector: 'gen-biox-configure-resource-view',
  templateUrl: './biox-configure-resource-view.component.html',
  styleUrls: ['./biox-configure-resource-view.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class BioxConfigureResourceViewComponent implements OnInit {

  formGp: FormGroup = new FormGroup({});

  configs: FlDynamicFormFieldConfig[];

  title: string;
  viewSpecConfig: BioxResourceViewSpecWithConfig;

  private readonly methodFieldPrefix: string = 'method_';
  private readonly viewFieldPrefix: string = 'view_';

  constructor(@Inject(MAT_DIALOG_DATA) input: BioxConfigureResourceViewInput,
              private dialogRef: MatDialogRef<BioxConfigureResourceViewComponent>) {
    this.title = input.title;
    this.viewSpecConfig = input.viewSpecConfig;
  }

  ngOnInit(): void {
    const configs: FlDynamicFormFieldConfig[] = [];

    // add the config for method config
    const methodsConfigs: FlDynamicFormFieldConfig[] =
      this.viewSpecConfig.viewSpec.methodSpecs.convertToFieldConfigs(this.viewSpecConfig.config.methodConfig);

    // prefix the method config with 'method_'
    for (const methodsConfig of methodsConfigs) {
      methodsConfig.controlName = this.methodFieldPrefix + methodsConfig.controlName;
      configs.push(methodsConfig);
    }


    // add the config for view config
    const viewConfigs: FlDynamicFormFieldConfig[] =
      this.viewSpecConfig.viewSpec.viewSpecs.convertToFieldConfigs(this.viewSpecConfig.config.viewConfig);

    // prefix the view config with 'view_'
    for (const viewConfig of viewConfigs) {
      viewConfig.controlName = this.viewFieldPrefix + viewConfig.controlName;
      configs.push(viewConfig);
    }

    this.configs = configs;
  }

  submit(): void {
    if (this.formGp.valid) {
      const viewConfig = this.convertFormResultToViewConfig(this.formGp.getRawValue());
      this.dialogRef.close(viewConfig);
    }
  }

  private convertFormResultToViewConfig(formValue: any): BioxResourceViewConfig {
    const viewConfig = new BioxResourceViewConfig();

    // place the config in the right config object
    for (const controlName of Object.keys(formValue)) {
      if (controlName.startsWith(this.methodFieldPrefix)) {
        const configName = controlName.substr(this.methodFieldPrefix.length);
        viewConfig.methodConfig[configName] = formValue[controlName];
      } else {
        const configName = controlName.substr(this.viewFieldPrefix.length);
        viewConfig.viewConfig[configName] = formValue[controlName];
      }
    }

    return viewConfig;
  }

}
