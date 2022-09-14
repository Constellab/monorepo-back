import {ChangeDetectionStrategy, ChangeDetectorRef, Component, Inject, OnInit} from '@angular/core';
import {FormBuilder, FormGroup} from '@ngneat/reactive-forms';
import {
  LabResourceViewSpecComplete,
  LabResourceViewSpecWithConfig,
} from '../../../../model/entities/resource/lab-resource-view.entity';
import {Validators} from '@angular/forms';
import {LabConfig, LabConfigureSpecsForm} from '../../../../model/entities/lab-config.entity';
import {FL_PORTAL_DATA, FlFormHelper, FlOverlayRef} from '@monorepo/front-core-lib';
import {LabTransformerWithConfig} from '../../../../model/global/lab-transformer.class';
import {
  LabConfigureSpecsFormComponent
} from '../../../lab-config-core/component/lab-configure-specs-form/lab-configure-specs-form.component';
import {
  LabTransformResourceComponent,
  LabTransformResourceForm
} from '../../../lab-transformer-core/component/lab-transform-resource/lab-transform-resource.component';
import {LabResourceService} from '../../../../entity-service/lab-resource.service';
import {RvViewDisplayMode} from '@monorepo/resource-view';
import {Observable} from 'rxjs';
import {PrConfigValues} from '@monorepo/protocol';

export interface LabConfigureResourceViewInput {
  resourceTypingName: string;
  resourceId?: string;
  title: string;
  viewMethodName: string;
  showDisplayModeControl: boolean; // whether to show the radio button to choose display mode

  preConfiguration?: LabResourceViewSpecWithConfig;
}

export interface LabConfigureResourceViewOutput {
  viewMethodName: string;
  viewConfigValues: PrConfigValues;
  displayMode: RvViewDisplayMode;
  transformersWithConfig: LabTransformerWithConfig[];
}


export interface LabConfigureResourceViewForm {
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
  configs: LabConfig;

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
    this.showDisplayModeControl = input.showDisplayModeControl;
  }

  ngOnInit(): void {
    this.getViewSpecs();


  }

  private getViewSpecs(): void {
    let obs: Observable<LabResourceViewSpecComplete>;

    // get the resource view specs from the resourceId if provided
    if (this.input.resourceId) {
      obs = this.resourceService.getResourceViewSpecsDetail(this.input.resourceId, this.input.viewMethodName);
    } else {
      // otherwise get it from the resource type
      obs = this.resourceService.getResourceTypeViewSpecsDetail(this.input.resourceTypingName, this.input.viewMethodName);
    }

    obs.subscribe({
      next: specs => this.init(specs),
      error: () => this.isLoading = false
    });
  }

  private init(specs: LabResourceViewSpecComplete): void {
    this.configs = LabConfig.fromSpecs(specs.configSpecs, this.input.preConfiguration?.viewConfigValues ?? {});

    const displayMode: RvViewDisplayMode = this.input.preConfiguration?.displayMode ?? 'fullScreen';

    this.formGp = new FormBuilder().group({
      displayMode: [displayMode, Validators.required],
      viewConfig: LabConfigureSpecsFormComponent.buildFormGroup(this.configs),
      transformers: LabTransformResourceComponent.buildFormArray(this.input.preConfiguration?.transformersWithConfig ?? []),
    });

    this.isLoading = false;
    this.cdr.markForCheck();
  }


  submit(): void {
    if (this.formGp.valid) {
      const output = this.convertFormValueToResult(this.formGp.getRawValue());
      this.overlayRef.dispose(output);
    } else {
      FlFormHelper.markAllAsTouched(this.formGp);
    }
  }

  private convertFormValueToResult(formValue: LabConfigureResourceViewForm): LabConfigureResourceViewOutput {
    const transformers: LabTransformerWithConfig[] = formValue.transformers.map(transformer => ({
      transformer: transformer.transformer,
      config: {...transformer.config.public, ...transformer.config.protected}
    }));

    return {
      viewMethodName: this.input.viewMethodName,
      viewConfigValues: {...formValue.viewConfig.public, ...formValue.viewConfig.protected},
      displayMode: formValue.displayMode,
      transformersWithConfig: transformers
    };
  }

  get numberOfTransformers(): number {
    return this.formGp.value.transformers.length;
  }

}
