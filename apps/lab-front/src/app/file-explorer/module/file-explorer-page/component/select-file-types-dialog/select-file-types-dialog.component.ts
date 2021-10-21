import {Component, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {FormArray, FormBuilder, FormGroup} from '@ngneat/reactive-forms';
import {FileResourceService} from '../../../../../core/entity-service/file-resource.service';
import {FlFileHelper, FlPortalAction, FlPortalActionsService, FlTranslateService} from '@monorepo/front-core-lib';
import {Validators} from '@angular/forms';
import {BioxFileType, constFileResourceTypingName} from '../../../../../core/model/entities/resource/file-resource.entity';

export interface SelectFileTypesDialogInput {
  file: File;
  typingName: string;
}


/**
 * Dialog used before upload files to set the types of the files
 */
@Component({
  selector: 'gen-select-file-types-dialog',
  templateUrl: './select-file-types-dialog.component.html',
  styleUrls: ['./select-file-types-dialog.component.scss']
})
export class SelectFileTypesDialogComponent implements OnInit {

  formArray: FormArray<SelectFileTypesDialogInput>;
  formGp: FormGroup;

  fileTypes: BioxFileType[];
  getFileTypeIsLoading: boolean = true;


  constructor(@Inject(MAT_DIALOG_DATA) private files: SelectFileTypesDialogInput[],
              private fileResourceService: FileResourceService,
              private actionsService: FlPortalActionsService,
              private translateService: FlTranslateService,
              private dialogRef: MatDialogRef<SelectFileTypesDialogComponent>) {
  }

  ngOnInit(): void {
    this.fileResourceService.getFileTypes().subscribe(
      fileTypes => this.getFileTypesSuccess(fileTypes),
      () => this.getFileTypeIsLoading = false
    );
  }

  private getFileTypesSuccess(fileTypes: BioxFileType[]): void {
    // detect the typing name automatically
    for (const file of this.files) {
      // if file does not have a typing name, detect the file type
      if (file.typingName == null) {
        const extension = FlFileHelper.getFileExtension(file.file.name);

        const fileType: BioxFileType = fileTypes.find(fileType => fileType.extensionIsSupported(extension));

        if (fileType != null) {
          file.typingName = fileType.typingName;
        } else {
          // set the file as default typing name
          file.typingName = constFileResourceTypingName;
        }
      }
    }

    this.buildForm();
    this.fileTypes = fileTypes;
    this.getFileTypeIsLoading = false;
  }

  private buildForm(): void {
    this.formArray = new FormArray<SelectFileTypesDialogInput>([]);
    for (const file of this.files) {
      this.formArray.push(new FormBuilder().group({
        file: [file.file, Validators.required],
        typingName: [file.typingName, Validators.required]
      }) as FormGroup<SelectFileTypesDialogInput>);
    }

    this.formGp = new FormBuilder().group({
      array: this.formArray
    });
  }

  submit(): void {
    if (this.formGp.valid) {
      this.uploadFiles(this.formArray.getRawValue());
    }
  }

  private uploadFiles(fileWithType: SelectFileTypesDialogInput[]): void {
    const text: string = this.files.length > 1 ?
      this.translateService.translate('fe.uploading_files', {param: {nbFiles: this.files.length}}) :
      this.files[0].file.name;

    const action: FlPortalAction = {
      text: text,
      type: FileResourceService.uploadFileActon,
      action: this.fileResourceService.uploadFiles(fileWithType.map(file => file.file), fileWithType.map(fileType => fileType.typingName)),
    };

    this.actionsService.addAction(action, true);
    this.dialogRef.close();
  }

}
