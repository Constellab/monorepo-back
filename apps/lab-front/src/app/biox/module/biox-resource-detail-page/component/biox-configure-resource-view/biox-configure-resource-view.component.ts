import {ChangeDetectionStrategy, Component, Inject, OnInit} from '@angular/core';
import {FormBuilder, FormGroup} from '@ngneat/reactive-forms';
import {
  BioxResourceViewConfig,
  BioxResourceViewDisplayMode,
  BioxResourceViewSpecWithConfig,
  BioxResourceViewTypeInfo
} from '../../../../../core/model/entities/resource/biox-resource-view.entity';
import {Validators} from '@angular/forms';
import {BioxConfigData} from '../../../../../core/model/entities/biox-config.entity';
import {FL_PORTAL_DATA, FlFormHelper, FlOverlayRef} from '@monorepo/front-core-lib';
import {BioxTransformerWithConfig} from '../../../../../core/model/global/biox-transformer.class';
import {
  BioxConfigureSpecsForm,
  BioxConfigureSpecsFormComponent
} from '../../../../../core/entity-module/biox-config-core/component/biox-configure-specs-form/biox-configure-specs-form.component';
import {
  BioxTransformResourceComponent,
  BioxTransformResourceForm
} from '../../../../../core/entity-module/biox-transformer/component/biox-transform-resource/biox-transform-resource.component';

export interface BioxConfigureResourceViewInput {
  title: string;
  viewSpecConfig: BioxResourceViewSpecWithConfig;
  viewTypeInfo: BioxResourceViewTypeInfo;
  resourceTypingName: string;
}

interface BioxConfigureResourceViewForm {
  displayMode: BioxResourceViewDisplayMode;
  viewConfig: BioxConfigureSpecsForm;
  transformers: BioxTransformResourceForm[];
}

/**
 * Portal to configure resource view spec
 */
@Component({
  selector: 'gen-biox-configure-resource-view',
  templateUrl: './biox-configure-resource-view.component.html',
  styleUrls: ['./biox-configure-resource-view.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class BioxConfigureResourceViewComponent implements OnInit {

  formGp: FormGroup<BioxConfigureResourceViewForm>;
  configs: BioxConfigData;

  title: string;
  showDisplayModeControl: boolean;
  resourceTypingName: string;

  constructor(@Inject(FL_PORTAL_DATA) private input: BioxConfigureResourceViewInput,
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
      viewConfig: BioxConfigureSpecsFormComponent.buildFormGroup(this.configs),
      transformers: BioxTransformResourceComponent.buildFormArray(this.input.viewSpecConfig.transformersWithConfig),
    });
    // don't show the button mode if the view type support only one mode
    this.showDisplayModeControl = !this.input.viewTypeInfo.forceDefaultDisplayMode;
  }

  private initFormFieldConfig(): void {
    const viewSpecConfig = this.input.viewSpecConfig;
    this.configs = BioxConfigData.fromSpecs(viewSpecConfig.viewSpec.specs, viewSpecConfig.viewConfig.configValues);
  }

  submit(): void {
    if (this.formGp.valid) {
      const viewConfig = this.convertFormValueToResult(this.formGp.getRawValue());
      this.overlayRef.dispose(viewConfig);
    } else {
      FlFormHelper.markAllAsTouched(this.formGp);
    }
  }

  private convertFormValueToResult(formValue: BioxConfigureResourceViewForm): BioxResourceViewSpecWithConfig {
    const transformers: BioxTransformerWithConfig[] = formValue.transformers.map(transformer => ({
      transformer: transformer.transformer,
      config: {...transformer.config.public, ...transformer.config.protected}
    }));

    return {
      viewSpec: this.input.viewSpecConfig.viewSpec,
      viewConfig: new BioxResourceViewConfig({...formValue.viewConfig.public, ...formValue.viewConfig.protected}),
      displayMode: formValue.displayMode,
      transformersWithConfig: transformers
    };
  }

}
