import {Component, Inject, OnInit} from '@angular/core';
import {
  FlFormDialogAbstractDirective,
  FlFormDialogInput,
  FlSnackBarService,
  FlTag,
  FlTagHelper
} from '@monorepo/front-core-lib';
import {Observable} from 'rxjs';
import {LabTagEntity} from '../../../../model/entities/lab-tag.entity';
import {FormBuilder, FormGroup} from '@ngneat/reactive-forms';
import {MAT_LEGACY_DIALOG_DATA as MAT_DIALOG_DATA, MatLegacyDialogRef as MatDialogRef} from '@angular/material/legacy-dialog';
import {LabTagService} from '../../../../entity-service/lab-tag.service';
import {Validators} from '@angular/forms';


/**
 * Dialog to create of update a tag
 */
@Component({
  selector: 'lab-tag-form-dialog',
  templateUrl: './lab-tag-form-dialog.component.html',
  styleUrls: ['./lab-tag-form-dialog.component.scss']
})
export class LabTagFormDialogComponent extends FlFormDialogAbstractDirective<FlTag, LabTagEntity>
  implements OnInit {

  maxLength = FlTagHelper.MAX_LENGTH;

  constructor(@Inject(MAT_DIALOG_DATA) protected dialogInput: FlFormDialogInput<FlTag>,
              private tagService: LabTagService,
              snackBarService: FlSnackBarService,
              dialogRef: MatDialogRef<LabTagFormDialogComponent>) {
    super(dialogInput, snackBarService, dialogRef);
  }

  ngOnInit(): void {
    this.init();
  }

  buildForm(): FormGroup<FlTag> {
    const defaultKey = this.dialogInput.object?.key ?? null;
    return new FormBuilder().group({
      key: [{
        value: defaultKey,
        disabled: defaultKey != null
      }, Validators.required],
      value: [null, Validators.required],
    });
  }

  create(formValue: FlTag): Observable<LabTagEntity> {
    return this.tagService.createTag(formValue.key, formValue.value);
  }

  getCreateSuccessMessage(): string {
    return 'tag_created';
  }

  getUpdateSuccessMessage(): string {
    return 'tag_updated';
  }

  update(formValue: FlTag): Observable<LabTagEntity> {
    return this.tagService.updateTag(this.dialogInput.object.key,
      this.dialogInput.object.value, formValue.value);
  }


  get title(): string {
    return this.isCreateMode() ? 'tag_create' : 'tag_update';
  }

}
