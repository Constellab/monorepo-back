import {Component, Inject, OnInit} from '@angular/core';
import {FL_PORTAL_DATA, FlFormHelper, FlOverlayRef} from '@monorepo/front-core-lib';
import {
  BioxTransformForm,
  CallTransformerParams,
  convertTransformFormToParams
} from '../../../../model/global/biox-transformer.class';
import {BioxResourceService} from '../../../../entity-service/biox-resource.service';
import {BioxResource} from '../../../../model/entities/resource/biox-resource.entity';
import {RouterService} from '../../../../service/router.service';
import {
  BioxTransformResourceComponent,
  BioxTransformResourceForm
} from '../biox-transform-resource/biox-transform-resource.component';
import {FormBuilder, FormGroup} from '@ngneat/reactive-forms';

export interface BioxTransformResourcePortalInput {
  resourceTypingName: string;
  resourceName: string;
  resourceId: string;
}

interface BioxTransformResourcePortalForm {
  transformers: BioxTransformResourceForm[];
}

/**
 * Dialog to transform a resource using transformers
 */
@Component({
  selector: 'gen-biox-transform-resource-portal',
  templateUrl: './biox-transform-resource-portal.component.html',
  styleUrls: ['./biox-transform-resource-portal.component.scss']
})
export class BioxTransformResourcePortalComponent implements OnInit {

  resourceTypingName: string;

  resourceName: string;

  formGp: FormGroup<BioxTransformResourcePortalForm>;
  isLoading: boolean = false;

  constructor(@Inject(FL_PORTAL_DATA) private input: BioxTransformResourcePortalInput,
              private resourceService: BioxResourceService,
              private overlayRef: FlOverlayRef,
              private routerService: RouterService) {
    this.resourceTypingName = input.resourceTypingName;
    this.resourceName = input.resourceName;
  }

  ngOnInit(): void {
    this.formGp = new FormBuilder().group({
      transformers: BioxTransformResourceComponent.buildFormArray([], 1)
    });
  }

  submit(): void {
    if (this.formGp.valid && !this.isLoading) {
      this.callTransformer(this.formGp.get('transformers').value);
    } else {
      FlFormHelper.markAllAsTouched(this.formGp);
    }
  }

  private callTransformer(formValue: BioxTransformForm[]): void {
    const transformers: CallTransformerParams[] = convertTransformFormToParams(formValue);
    this.isLoading = true;
    this.resourceService.transformResource(transformers, this.input.resourceId).subscribe(
      experiment => this.onTransformSuccess(experiment),
      () => this.isLoading = false
    );
  }

  private onTransformSuccess(resource: BioxResource): void {
    this.isLoading = false;
    this.overlayRef.dispose();
    this.routerService.navigateToBioxResourceDetail(resource.id);
  }
}
