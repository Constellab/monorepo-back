import {ChangeDetectionStrategy, Component, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {FormBuilder, FormGroup} from '@ngneat/reactive-forms';
import {
  BioxResourceViewConfig,
  BioxResourceViewDisplayMode,
  BioxResourceViewSpecWithConfig,
  BioxResourceViewTypeInfo
} from '../../../../../core/model/entities/resource/biox-resource-view.entity';
import {FlDynamicFormFieldConfig} from '@monorepo/front-core-lib';
import {Validators} from '@angular/forms';

export interface BioxConfigureResourceViewInput {
  title: string;
  viewSpecConfig: BioxResourceViewSpecWithConfig;
  viewTypeInfo: BioxResourceViewTypeInfo;
}

export interface BioxConfigureResourceViewResult {
  viewConfig: BioxResourceViewConfig;
  displayMode: BioxResourceViewDisplayMode;
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

  showDisplayModeControl: boolean;

  private readonly methodFieldPrefix: string = 'method_';
  private readonly viewFieldPrefix: string = 'view_';

  constructor(@Inject(MAT_DIALOG_DATA) private input: BioxConfigureResourceViewInput,
              private dialogRef: MatDialogRef<BioxConfigureResourceViewComponent>) {
    this.title = input.title;
  }

  ngOnInit(): void {
    this.initFormGroup();
    this.initFormFieldConfig();
  }

  private initFormGroup(): void {
    this.formGp = new FormBuilder().group({
      displayMode: [this.input.viewSpecConfig.displayMode, Validators.required]
    });
    // don't show the button mode if the view type support only one mode
    this.showDisplayModeControl = !this.input.viewTypeInfo.forceDefaultDisplayMode
  }

  private initFormFieldConfig(): void {
    const configs: FlDynamicFormFieldConfig[] = [];
    const viewSpecConfig = this.input.viewSpecConfig;

    // add the config for method config
    const methodsConfigs: FlDynamicFormFieldConfig[] =
      viewSpecConfig.viewSpec.methodSpecs.convertToFieldConfigs(viewSpecConfig.viewConfig.methodConfig);

    // prefix the method config with 'method_'
    for (const methodsConfig of methodsConfigs) {
      methodsConfig.controlName = this.methodFieldPrefix + methodsConfig.controlName;
      configs.push(methodsConfig);
    }


    // add the config for view config
    const viewConfigs: FlDynamicFormFieldConfig[] =
      viewSpecConfig.viewSpec.viewSpecs.convertToFieldConfigs(viewSpecConfig.viewConfig.viewConfig);

    // prefix the view config with 'view_'
    for (const viewConfig of viewConfigs) {
      viewConfig.controlName = this.viewFieldPrefix + viewConfig.controlName;
      configs.push(viewConfig);
    }

    this.configs = configs;

  }

  submit(): void {
    if (this.formGp.valid) {
      const viewConfig = this.convertFormValueToResult(this.formGp.getRawValue());
      this.dialogRef.close(viewConfig);
    }
  }

  private convertFormValueToResult(formValue: any): BioxConfigureResourceViewResult {
    const viewConfig = new BioxResourceViewConfig();

    // place the config in the right config object
    for (const controlName of Object.keys(formValue)) {
      if (controlName.startsWith(this.methodFieldPrefix)) {
        const configName = controlName.substr(this.methodFieldPrefix.length);
        viewConfig.methodConfig[configName] = formValue[controlName];
      } else if (controlName.startsWith(this.viewFieldPrefix)) {
        const configName = controlName.substr(this.viewFieldPrefix.length);
        viewConfig.viewConfig[configName] = formValue[controlName];
      }
    }

    return {
      viewConfig: viewConfig,
      displayMode: formValue.displayMode
    };
  }

}
