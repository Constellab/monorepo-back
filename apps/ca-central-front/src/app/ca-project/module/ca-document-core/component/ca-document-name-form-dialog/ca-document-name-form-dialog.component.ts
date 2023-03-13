import {Component, Inject, OnInit} from '@angular/core';
import {FlFormDialogAbstractDirective, FlFormDialogInput, FlSnackBarService} from '@monorepo/front-core-lib';
import {FormBuilder, FormGroup} from '@ngneat/reactive-forms';
import {Observable} from 'rxjs';
import {MAT_LEGACY_DIALOG_DATA as MAT_DIALOG_DATA, MatLegacyDialogRef as MatDialogRef} from '@angular/material/legacy-dialog';
import {CaProjectService} from '../../../../../ca-core/service-api/ca-project.service';
import {Validators} from '@angular/forms';

interface CaDocumentNameForm {
  name: string;
}

export interface CaDocumentNameFormDialogInput extends FlFormDialogInput<CaDocumentNameForm> {
  projectId: string;
  documentId?: string;
}

/**
 * Dialog to create a constellab document (in create mode)
 * In update mode it rename a constellab document or a project document
 */
@Component({
  selector: 'ca-document-name-form-dialog',
  templateUrl: './ca-document-name-form-dialog.component.html',
  styleUrls: ['./ca-document-name-form-dialog.component.scss']
})
export class CaDocumentNameFormDialogComponent extends FlFormDialogAbstractDirective<CaDocumentNameForm, any>

  implements OnInit {

  constructor(@Inject(MAT_DIALOG_DATA) protected dialogInput: CaDocumentNameFormDialogInput,
              private projectService: CaProjectService,
              snackBarService: FlSnackBarService,
              dialogRef: MatDialogRef<CaDocumentNameFormDialogComponent>) {
    super(dialogInput, snackBarService, dialogRef);
  }

  ngOnInit(): void {
    this.init();
  }

  buildForm(): FormGroup<CaDocumentNameForm> {
    return new FormBuilder().group({
      name: [null, Validators.required]
    });
  }

  create(formValue: CaDocumentNameForm): Observable<any> {
    return this.projectService.createConstellabDocument(this.dialogInput.projectId, formValue.name);
  }

  getCreateSuccessMessage(): string {
    return 'document_created';
  }

  getUpdateSuccessMessage(): string {
    return 'document_renamed';
  }

  update(formValue: { name: string }): Observable<any> {
    return this.projectService.renameDocument(this.dialogInput.documentId, formValue.name);
  }

  get title(): string {
    return this.isUpdateMode() ? 'rename_document' : 'create_constellab_document';
  }


}
