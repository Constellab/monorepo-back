import {Component, Inject, OnInit} from '@angular/core';
import {FlFormDialogAbstractDirective, FlFormDialogInput, FlSnackBarService} from '@monorepo/front-core-lib';
import {HaFolder} from '../../../../ha-core/ha-model/ha-entities/ha-folder.class';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {HaFolderService} from '../../../../ha-core/ha-service/ha-folder.service';
import {FormBuilder, FormGroup} from '@ngneat/reactive-forms';
import {Validators} from '@angular/forms';
import {Observable} from 'rxjs';
import {HaDocumentationService} from '../../../../ha-core/ha-service/ha-documentation.service';
import {HaNodeDTO} from '../../../../ha-core/ha-model/ha-entities/ha-node.class';
import {HaDocumentation} from '../../../../ha-core/ha-model/ha-entities/ha-documentation.class';

@Component({
  selector: 'ha-public-sidenav-create-form-dialog',
  templateUrl: './ha-public-sidenav-create-form-dialog.component.html',
  styleUrls: ['./ha-public-sidenav-create-form-dialog.component.scss']
})
export class HaPublicSidenavCreateFormDialogComponent extends FlFormDialogAbstractDirective<Partial<HaNodeDTO>> implements OnInit{

  folders: HaFolder[];
  isLoading: boolean = false;
  isUpdate: boolean = false;
  type: string;

  constructor(@Inject(MAT_DIALOG_DATA)
              protected dialogInput: FlFormDialogInput<HaNodeDTO>,
              private folderService: HaFolderService,
              private documentationService: HaDocumentationService,
              snackBarService: FlSnackBarService,
              dialogRef: MatDialogRef<HaPublicSidenavCreateFormDialogComponent>) {
    super(dialogInput, snackBarService, dialogRef);
  }

  ngOnInit(): void {
    this.isUpdate = this.dialogInput.mode == 'update';
    this.init();
    this.formGp.value.folderId = this.dialogInput.object.folderId;
  }

  buildForm(): FormGroup<Partial<HaNodeDTO>> {
    return new FormBuilder().group({
      id: [null],
      title: [null, Validators.required],
      isFolder: [false]
    });
  }

  create(formValue: HaNodeDTO): Observable<HaFolder | HaDocumentation> {
    formValue.folderId = this.dialogInput.object.folderId;

    if(this.formGp.value.isFolder){
      return this.folderService.create(formValue);
    }
    return this.folderService.createDocumentation(formValue);
  }

  update(formValue: HaNodeDTO): Observable<HaFolder | HaDocumentation> {
    return this.formGp.value.isFolder ? this.folderService.update(formValue) : this.documentationService.update(formValue);
  }

  getCreateSuccessMessage(): string {
    return 'element_created';
  }

  getUpdateSuccessMessage(): string {
    return 'element_updated';
  }


}
