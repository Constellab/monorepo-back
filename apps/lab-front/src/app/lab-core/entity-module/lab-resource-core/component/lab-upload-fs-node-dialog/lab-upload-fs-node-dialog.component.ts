import {Component, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {LabFileResourceService} from '../../../../entity-service/lab-file-resource.service';
import {FlFileHelper, FlPortalAction, FlPortalActionsService, FlTranslateService} from '@monorepo/front-core-lib';
import {FormArray, FormBuilder, FormGroup} from '@ngneat/reactive-forms';
import {LabFileType} from '../../../../model/entities/resource/lab-file-type';
import {Validators} from '@angular/forms';
import {Observable} from 'rxjs';
import {LabTypingName} from '../../../../model/entities/lab-typing-name.class';

export type UploadFsNodeMode = 'files' | 'folder'

export interface UploadFsNodeDialogInput {
  selectedNodes: UploadFsNodeMode;
  files: File[];
}

// object used in the form
interface UploadForm {
  uploadMode: UploadFsNodeMode;
  files: FileWithType[];
}

export interface FileWithType {
  file: File;
  typingName: string;
}

/**
 * Dialog used when upload files or a folder to the lab
 * If files --> it allows to select the file type for each uploaded file
 * If folder --> one mode like the one before and one mode to directly upload the folder
 */
@Component({
  selector: 'lab-upload-fs-node-dialog',
  templateUrl: './lab-upload-fs-node-dialog.component.html',
  styleUrls: ['./lab-upload-fs-node-dialog.component.scss']
})
export class LabUploadFsNodeDialogComponent implements OnInit {

  selectedNodes: 'files' | 'folder';

  formArray: FormArray<FileWithType>;
  formGp: FormGroup<UploadForm>;

  fileTypes: LabFileType[];
  getFileTypeIsLoading: boolean = true;

  constructor(@Inject(MAT_DIALOG_DATA) private input: UploadFsNodeDialogInput,
              private fileResourceService: LabFileResourceService,
              private actionsService: FlPortalActionsService,
              private translateService: FlTranslateService,
              private dialogRef: MatDialogRef<LabUploadFsNodeDialogComponent>) {
    this.selectedNodes = input.selectedNodes;
  }

  ngOnInit(): void {
    this.fileResourceService.getFileTypes().subscribe(
      fileTypes => this.getFileTypesSuccess(fileTypes),
      () => this.getFileTypeIsLoading = false
    );
  }

  get title(): string {
    return this.selectedNodes === 'files' ? 'databox.select_file_types' : 'databox.upload_folder';
  }

  // show the selection of file types when the mode is not folder
  get showSelectFileTypes(): boolean {
    return this.formGp.getRawValue().uploadMode !== 'folder';
  }

  private getFileTypesSuccess(fileTypes: LabFileType[]): void {
    const filesWithType: FileWithType[] = [];
    // detect the typing name automatically
    for (const file of this.input.files) {
      // if file does not have a typing name, detect the file type
      const extension = FlFileHelper.getFileExtension(file.name);

      const fileType: LabFileType = fileTypes.find(fileType => fileType.extensionIsSupported(extension));

      if (fileType != null) {
        filesWithType.push({file: file, typingName: fileType.typingName});
      } else {
        // set the file as default typing name
        filesWithType.push({file: file, typingName: LabTypingName.resource.file});
      }

    }

    this.buildForm(filesWithType);
    this.fileTypes = fileTypes;
  }

  private buildForm(files: FileWithType[]): void {
    this.formArray = new FormArray<FileWithType>([]);
    for (const file of files) {
      this.formArray.push(new FormBuilder().group({
        file: [file.file, Validators.required],
        typingName: [file.typingName, Validators.required]
      }) as FormGroup<FileWithType>);
    }

    this.formGp = new FormBuilder().group({
      uploadMode: 'files',
      files: this.formArray
    });
    this.getFileTypeIsLoading = false;
  }

  submit(): void {
    if (this.formGp.valid) {
      this.uploadFiles(this.formGp.getRawValue());
    }
  }

  private uploadFiles(formValue: UploadForm): void {
    let text: string;
    let obs: Observable<any>;

    // mode when uploading all the file separately
    if (formValue.uploadMode === 'files') {
      text = formValue.files.length > 1 ?
        this.translateService.translate('databox.uploading_files', {param: {nbFiles: formValue.files.length}}) :
        formValue.files[0].file.name;

      obs = this.fileResourceService.uploadFiles(formValue.files.map(file => file.file),
        formValue.files.map(fileType => fileType.typingName));
    } else {
      // mode when uploading only one folder with everything
      text = this.translateService.translate('databox.uploading_folder');
      obs = this.fileResourceService.uploadFolder(formValue.files.map(file => file.file));
    }


    const action: FlPortalAction = {
      text: text,
      type: LabFileResourceService.uploadFileActon,
      action: obs,
      trackHttpEvents: true,
    };

    this.actionsService.addAction(action, false);
    this.dialogRef.close();
  }

}
