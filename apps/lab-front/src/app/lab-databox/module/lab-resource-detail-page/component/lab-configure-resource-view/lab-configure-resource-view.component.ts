import {ChangeDetectionStrategy, Component, Inject, OnInit} from '@angular/core';
import {FormBuilder, FormGroup} from '@ngneat/reactive-forms';
import {
  LabResourceViewConfig,
  LabResourceViewDisplayMode,
  LabResourceViewSpecWithConfig,
  LabResourceViewTypeInfo
} from '../../../../../lab-core/model/entities/resource/lab-resource-view.entity';
import {Validators} from '@angular/forms';
import {LabConfigData} from '../../../../../lab-core/model/entities/lab-config.entity';
import {FL_PORTAL_DATA, FlFormHelper, FlOverlayRef} from '@monorepo/front-core-lib';
import {LabTransformerWithConfig} from '../../../../../lab-core/model/global/lab-transformer.class';
import {
  LabConfigureSpecsForm,
  LabConfigureSpecsFormComponent
} from '../../../../../lab-core/entity-module/lab-config-core/component/lab-configure-specs-form/lab-configure-specs-form.component';
import {
  LabTransformResourceComponent,
  LabTransformResourceForm
} from '../../../../../lab-core/entity-module/lab-transformer/component/lab-transform-resource/lab-transform-resource.component';

export interface LabConfigureResourceViewInput {
  title: string;
  viewSpecConfig: LabResourceViewSpecWithConfig;
  viewTypeInfo: LabResourceViewTypeInfo;
  resourceTypingName: string;
}

interface LabConfigureResourceViewForm {
  displayMode: LabResourceViewDisplayMode;
  viewConfig: LabConfigureSpecsForm;
  transformers: LabTransformResourceForm[];
}

/**
 * Portal to configure resource view spec
 */
@Component({
  selector: 'lab-configure-resource-view',
  templateUrl: './lab-configure-resource-view.component.html',
  styleUrls: ['./lab-configure-resource-view.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LabConfigureResourceViewComponent implements OnInit {

  formGp: FormGroup<LabConfigureResourceViewForm>;
  configs: LabConfigData;

  title: string;
  showDisplayModeControl: boolean;
  resourceTypingName: string;

  constructor(@Inject(FL_PORTAL_DATA) private input: LabConfigureResourceViewInput,
              private overlayRef: FlOverlayRef) {
    this.title = input.title;
    this.resourceTypingName = input.resourceTypingName;
  }

  ngOnInit(): void {
    this.initFormFieldConfig();
    this.initFormGroup();
  }

  private initFormGroup(): void {
    this.formGp = new FormBuilder().group({
      displayMode: [this.input.viewSpecConfig.displayMode, Validators.required],
      viewConfig: LabConfigureSpecsFormComponent.buildFormGroup(this.configs),
      transformers: LabTransformResourceComponent.buildFormArray(this.input.viewSpecConfig.transformersWithConfig),
    });
    // don't show the button mode if the view type support only one mode
    this.showDisplayModeControl = !this.input.viewTypeInfo.forceDefaultDisplayMode;
  }

  private initFormFieldConfig(): void {
    const viewSpecConfig = this.input.viewSpecConfig;
    this.configs = LabConfigData.fromSpecs(viewSpecConfig.viewSpec.specs, viewSpecConfig.viewConfig.configValues);
  }

  submit(): void {
    if (this.formGp.valid) {
      const viewConfig = this.convertFormValueToResult(this.formGp.getRawValue());
      this.overlayRef.dispose(viewConfig);
    } else {
      FlFormHelper.markAllAsTouched(this.formGp);
    }
  }

  private convertFormValueToResult(formValue: LabConfigureResourceViewForm): LabResourceViewSpecWithConfig {
    const transformers: LabTransformerWithConfig[] = formValue.transformers.map(transformer => ({
      transformer: transformer.transformer,
      config: {...transformer.config.public, ...transformer.config.protected}
    }));

    return {
      viewSpec: this.input.viewSpecConfig.viewSpec,
      viewConfig: new LabResourceViewConfig({...formValue.viewConfig.public, ...formValue.viewConfig.protected}),
      displayMode: formValue.displayMode,
      transformersWithConfig: transformers
    };
  }

}
