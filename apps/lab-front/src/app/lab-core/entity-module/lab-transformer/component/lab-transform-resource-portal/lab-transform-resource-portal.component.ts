import {Component, Inject, OnInit} from '@angular/core';
import {FL_PORTAL_DATA, FlFormHelper, FlOverlayRef} from '@monorepo/front-core-lib';
import {
  labConvertTransformFormToParams,
  LabTransformerWithConfig,
  LabTransformForm
} from '../../../../model/global/lab-transformer.class';
import {LabResourceService} from '../../../../entity-service/lab-resource.service';
import {LabResource} from '../../../../model/entities/resource/lab-resource.entity';
import {LabRouterService} from '../../../../service/lab-router.service';
import {
  LabTransformResourceComponent,
  LabTransformResourceForm
} from '../lab-transform-resource/lab-transform-resource.component';
import {FormBuilder, FormGroup} from '@ngneat/reactive-forms';
import {RvTransformerParams} from '@monorepo/resource-view';

export interface LabTransformResourcePortalInput {
  resourceTypingName: string;
  resourceName: string;
  resourceId: string;
  // use to init form with transformers and config
  currentTransformers: LabTransformerWithConfig[];
}

interface LabTransformResourcePortalForm {
  transformers: LabTransformResourceForm[];
}

/**
 * Dialog to transform a resource using transformers
 */
@Component({
  selector: 'lab-transform-resource-portal',
  templateUrl: './lab-transform-resource-portal.component.html',
  styleUrls: ['./lab-transform-resource-portal.component.scss']
})
export class LabTransformResourcePortalComponent implements OnInit {

  resourceTypingName: string;

  resourceName: string;

  formGp: FormGroup<LabTransformResourcePortalForm>;
  isLoading: boolean = false;

  constructor(@Inject(FL_PORTAL_DATA) private input: LabTransformResourcePortalInput,
              private resourceService: LabResourceService,
              private overlayRef: FlOverlayRef,
              private routerService: LabRouterService) {
    this.resourceTypingName = input.resourceTypingName;
    this.resourceName = input.resourceName;
  }

  ngOnInit(): void {
    this.formGp = new FormBuilder().group({
      transformers: LabTransformResourceComponent.buildFormArray(
        this.input.currentTransformers, 1)
    });
  }

  submit(): void {
    if (this.formGp.valid && !this.isLoading) {
      this.callTransformer(this.formGp.get('transformers').value);
    } else {
      FlFormHelper.markAllAsTouched(this.formGp);
    }
  }

  private callTransformer(formValue: LabTransformForm[]): void {
    const transformers: RvTransformerParams[] = labConvertTransformFormToParams(formValue);
    this.isLoading = true;
    this.resourceService.transformResource(transformers, this.input.resourceId).subscribe(
      experiment => this.onTransformSuccess(experiment),
      () => this.isLoading = false
    );
  }

  private onTransformSuccess(resource: LabResource): void {
    this.isLoading = false;
    this.overlayRef.dispose();
    this.routerService.navigateToResourceDetail(resource.id);
  }
}
