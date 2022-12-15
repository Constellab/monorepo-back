import {Component, Inject, OnInit} from '@angular/core';
import {FlFormDialogAbstractDirective, FlFormDialogInput, FlSnackBarService} from '@monorepo/front-core-lib';
import {LabShareLink, LabShareLinkType} from '../../../../model/entities/lab-share-link.entity';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {FormBuilder, FormGroup} from '@ngneat/reactive-forms';
import {Validators} from '@angular/forms';
import {Observable} from 'rxjs';
import {LabShareLinkService} from '../../../../entity-service/lab-share-link.service';

export interface LabShareLinkFormDialogInput extends FlFormDialogInput<LabShareLink> {
  createTitle?: string;
  entityId?: string;
  entityType?: LabShareLinkType;
}

@Component({
  selector: 'lab-share-link-form-dialog',
  templateUrl: './lab-share-link-form-dialog.component.html',
  styleUrls: ['./lab-share-link-form-dialog.component.scss']
})
export class LabShareLinkFormDialogComponent extends FlFormDialogAbstractDirective<Partial<LabShareLink>, LabShareLink>
  implements OnInit {

  constructor(@Inject(MAT_DIALOG_DATA) protected dialogInput: LabShareLinkFormDialogInput,
              private shareLinkService: LabShareLinkService,
              snackBarService: FlSnackBarService,
              dialogRef: MatDialogRef<LabShareLinkFormDialogComponent>) {
    super(dialogInput, snackBarService, dialogRef);
  }

  ngOnInit(): void {
    this.init();
  }

  buildForm(): FormGroup<Partial<LabShareLink>> {
    return new FormBuilder().group({
      id: [null],
      entityId: [this.dialogInput.entityId, Validators.required],
      entityType: [this.dialogInput.entityType, Validators.required],
      validUntil: [null, Validators.required],
    });
  }

  create(formValue: Partial<LabShareLink>): Observable<LabShareLink> {
    return this.shareLinkService.create(formValue);
  }

  update(formValue: Partial<LabShareLink>): Observable<LabShareLink> {
    return this.shareLinkService.update(formValue);
  }

  get title(): string {
    return this.isCreateMode() ? this.dialogInput.createTitle : 'biox.update_share_link';
  }

  getCreateSuccessMessage(): string {
    return 'biox.share_entity_success';
  }

  getUpdateSuccessMessage(): string {
    return 'biox.share_link_updated';
  }


}
