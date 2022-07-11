import {Component, Inject, OnInit} from '@angular/core';
import {FlFormDialogAbstractDirective, FlFormDialogInput, FlSnackBarService} from '@monorepo/front-core-lib';
import {HaFolder} from '../../../../ha-core/ha-model/ha-entities/ha-folder.class';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {HaFolderService} from '../../../../ha-core/ha-service/ha-folder.service';
import {FormBuilder, FormGroup} from '@ngneat/reactive-forms';
import {Validators} from '@angular/forms';
import {Observable} from 'rxjs';
import {HaDocumentationService} from '../../../../ha-core/ha-service/ha-documentation.service';
import {HaNodeDTO, HaNodeType} from '../../../../ha-core/ha-model/ha-entities/ha-node.class';
import {HaDocumentation} from '../../../../ha-core/ha-model/ha-entities/ha-documentation.class';

@Component({
  selector: 'ha-public-sidenav-create-form-dialog',
  templateUrl: './ha-public-sidenav-create-form-dialog.component.html',
  styleUrls: ['./ha-public-sidenav-create-form-dialog.component.scss']
})
export class HaPublicSidenavCreateFormDialogComponent extends FlFormDialogAbstractDirective<Partial<HaNodeDTO>> implements OnInit {

  isLoading: boolean = false;
  isLoadingImport: boolean = false;
  isUpdate: boolean = false;
  type: string;
  errorFile: boolean;
  errorFileText: string;

  static isValidTechDocFile(file: any): boolean{
    return file.brick_name != null && file.brick_version != null && file.json_version != null;
  }

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
      isFolder: [false],
      type: [HaNodeType.DOC]
    });
  }

  create(formValue: HaNodeDTO): Observable<HaFolder | HaDocumentation> {
    formValue.folderId = this.dialogInput.object.folderId;

    this.formGp.value.isFolder = this.formGp.value.type == HaNodeType.FOL;

    if (this.formGp.value.isFolder) {
      return this.folderService.create(formValue);
    }
    return this.folderService.createDocumentation(formValue);
  }

  onFileSelected($event: File): void {
    this.isLoading = true;

    if ($event == null) {
      return;
    }

    this.errorFile = false;
    if (!$event.name.endsWith('.json')) {
      this.errorFile = true;
      this.errorFileText = 'file_wrong_type';
    }

    if (typeof (FileReader) !== 'undefined' && !this.errorFile) {
      const reader = new FileReader();

      reader.onload = (e: any) => {
        const srcResult = JSON.parse(e.target.result);
        if(HaPublicSidenavCreateFormDialogComponent.isValidTechDocFile(srcResult)){
          this.dialogRef.close([srcResult, HaNodeType.TEC]);
          this.isLoading = false;
        } else {
          this.errorFile = true;
          this.errorFileText = 'file_wrong_type';
        }
        this.isLoading = false;

      };

      reader.readAsText($event);
    }

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
