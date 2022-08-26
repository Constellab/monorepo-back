import {ChangeDetectionStrategy, ChangeDetectorRef, Component, Inject, OnInit} from '@angular/core';
import {FormBuilder, FormGroup} from '@ngneat/reactive-forms';
import {LabResourceViewSpecWithConfig,} from '../../../../model/entities/resource/lab-resource-view.entity';
import {Validators} from '@angular/forms';
import {LabConfigData, LabConfigureSpecsForm} from '../../../../model/entities/lab-config.entity';
import {FL_PORTAL_DATA, FlFormHelper, FlOverlayRef} from '@monorepo/front-core-lib';
import {LabTransformerWithConfig} from '../../../../model/global/lab-transformer.class';
import {
  LabConfigureSpecsFormComponent
} from '../../../lab-config-core/component/lab-configure-specs-form/lab-configure-specs-form.component';
import {
  LabTransformResourceComponent,
  LabTransformResourceForm
} from '../../../lab-transformer/component/lab-transform-resource/lab-transform-resource.component';
import {LabResourceService} from '../../../../entity-service/lab-resource.service';
import {LabConfigSpecs} from '../../../../model/entities/lab-config-spec.entity';
import {RvResourceViewTypeInfo, RvViewDisplayMode} from '@monorepo/resource-view';

export interface LabConfigureResourceViewInput {
  title: string;
  viewSpecConfig: LabResourceViewSpecWithConfig;
  viewTypeInfo: RvResourceViewTypeInfo;
  resourceTypingName: string;
  resourceId: string;
}

interface LabConfigureResourceViewForm {
  displayMode: RvViewDisplayMode;
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

  isLoading: boolean = true;

  constructor(@Inject(FL_PORTAL_DATA) private input: LabConfigureResourceViewInput,
              private overlayRef: FlOverlayRef,
              private resourceService: LabResourceService,
              private cdr: ChangeDetectorRef) {
    this.title = input.title;
    this.resourceTypingName = input.resourceTypingName;
  }

  ngOnInit(): void {
    this.getViewSpecs();
  }

  private getViewSpecs(): void {
    this.resourceService.getResourceViewSpecsDetail(this.input.resourceId, this.input.viewSpecConfig.viewMethodName).subscribe(
      specs => this.init(specs),
      () => this.isLoading = false
    );
  }

  private init(specs: LabConfigSpecs): void {
    const viewSpecConfig = this.input.viewSpecConfig;
    this.configs = LabConfigData.fromSpecs(specs, viewSpecConfig.viewConfigValues);

    this.formGp = new FormBuilder().group({
      displayMode: [this.input.viewSpecConfig.displayMode, Validators.required],
      viewConfig: LabConfigureSpecsFormComponent.buildFormGroup(this.configs),
      transformers: LabTransformResourceComponent.buildFormArray(this.input.viewSpecConfig.transformersWithConfig),
    });
    // don't show the button mode if the view type support only one mode
    this.showDisplayModeControl = !this.input.viewTypeInfo.forceDefaultDisplayMode;
    this.isLoading = false;
    this.cdr.markForCheck();
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
      resourceId: this.input.resourceId,
      viewMethodName: this.input.viewSpecConfig.viewMethodName,
      viewName: this.input.viewSpecConfig.viewName,
      isDefaultView: this.input.viewSpecConfig.isDefaultView,
      viewConfigValues: {...formValue.viewConfig.public, ...formValue.viewConfig.protected},
      displayMode: formValue.displayMode,
      transformersWithConfig: transformers
    };
  }

  get numberOfTransformers(): number {
    return this.formGp.value.transformers.length;
  }

}
