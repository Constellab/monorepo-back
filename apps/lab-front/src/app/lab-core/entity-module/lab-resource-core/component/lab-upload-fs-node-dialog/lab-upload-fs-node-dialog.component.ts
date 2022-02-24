import {Component, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {LabFileResourceService} from '../../../../entity-service/lab-file-resource.service';
import {FlFileHelper, FlPortalAction, FlPortalActionsService, FlTranslateService} from '@monorepo/front-core-lib';
import {FormArray, FormBuilder, FormGroup} from '@ngneat/reactive-forms';
import {LabFileType} from '../../../../model/entities/resource/lab-file-type';
import {Validators} from '@angular/forms';
import {Observable} from 'rxjs';
import {LabTypingName} from '../../../../model/entities/lab-typing-name.class';
import {ClCachedObservable} from '@monorepo/core-lib';
import {LabTypeEntity} from '../../../../model/entities/lab-type/lab-type.entity';

export type UploadFsNodeMode = 'files' | 'folder'

export interface UploadFsNodeDialogInput {
  selectedNodes: UploadFsNodeMode;
  files: File[];
}

// object used in the form
interface UploadForm {
  uploadMode: UploadFsNodeMode;
  files: FsNodeWithType[];
}

interface FsNodeWithType {
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

  formArray: FormArray<FsNodeWithType>;
  formGp: FormGroup<UploadForm>;

  resourceTypes$: Observable<LabTypeEntity[]>;

  private fileTypes$: ClCachedObservable<LabFileType[]>;
  private folderTypes$: ClCachedObservable<LabTypeEntity[]>;

  constructor(@Inject(MAT_DIALOG_DATA) private input: UploadFsNodeDialogInput,
              private fileResourceService: LabFileResourceService,
              private actionsService: FlPortalActionsService,
              private translateService: FlTranslateService,
              private dialogRef: MatDialogRef<LabUploadFsNodeDialogComponent>) {
    this.selectedNodes = input.selectedNodes;
  }

  ngOnInit(): void {
    this.fileTypes$ = new ClCachedObservable(this.fileResourceService.getFileTypes());
    this.folderTypes$ = new ClCachedObservable(this.fileResourceService.getFolderTypes());
    this.buildForm();
    this.onUploadModeChange('files');
  }

  private buildForm(): void {
    this.formArray = new FormArray<FsNodeWithType>([]);
    this.formGp = new FormBuilder().group({
      uploadMode: 'files',
      files: this.formArray
    });
  }

  // show the selection of file types when the mode is not folder
  get showSelectFileTypes(): boolean {
    return this.formGp.getRawValue().uploadMode !== 'folder';
  }


  onUploadModeChange(mode: 'files' | 'folder'): void {
    this.formArray.clear();
    if (mode === 'files') {
      this.initFormFiles();
    } else {
      this.initFormFolder();
    }
  }

  private async initFormFiles(): Promise<void> {
    this.resourceTypes$ = this.fileTypes$.getObs();

    const fileTypes = await  this.fileTypes$.toPromise();
    const filesWithType: FsNodeWithType[] = [];
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

    for (const file of filesWithType) {
      this.addItemToFormArray(file);
    }
  }

  private initFormFolder(): void {
    this.resourceTypes$ = this.folderTypes$.getObs();

    this.addItemToFormArray({file: null, typingName: LabTypingName.resource.folder});
  }

  private addItemToFormArray(fileWithType: FsNodeWithType): void {
    this.formArray.push(new FormBuilder().group({
      file: [fileWithType.file],
      typingName: [fileWithType.typingName, Validators.required]
    }) as FormGroup<FsNodeWithType>);
  }

  submit(): void {
    if (this.formGp.valid) {

      const formValue = this.formGp.getRawValue();

      if (formValue.uploadMode === 'files') {
        this.uploadFiles(formValue.files);
      } else {
        this.uploadFolder(formValue.files);
      }

      this.dialogRef.close();
    }
  }

  private uploadFiles(files: FsNodeWithType[]): void {

    for (const file of files) {
      const action: FlPortalAction = {
        text: file.file.name,
        type: LabFileResourceService.uploadFileActon,
        action: this.fileResourceService.uploadFile(file.file, file.typingName),
        trackHttpEvents: true,
      };

      this.actionsService.addAction(action, false);
    }
  }

  private uploadFolder(files: FsNodeWithType[]): void {
    // in folder mode, there is only on element in array, corresponding to the folder
    const folderTypingName = files[0].typingName;

    const action: FlPortalAction = {
      text: {text: 'databox.uploading_folder', translateText: true},
      type: LabFileResourceService.uploadFileActon,
      action: this.fileResourceService.uploadFolder(folderTypingName, this.input.files),
      trackHttpEvents: true,
    };

    this.actionsService.addAction(action, false);
    this.dialogRef.close();
  }

  // private uploadFiles(formValue: UploadForm): void {
  //   let text: string;
  //   let obs: Observable<any>;
  //
  //   // mode when uploading all the file separately
  //   if (formValue.uploadMode === 'files') {
  //     text = formValue.files.length > 1 ?
  //       this.translateService.translate('databox.uploading_files', {param: {nbFiles: formValue.files.length}}) :
  //       formValue.files[0].file.name;
  //
  //     obs = this.fileResourceService.uploadFiles(formValue.files.map(file => file.file),
  //       formValue.files.map(fileType => fileType.typingName));
  //   } else {
  //     // mode when uploading only one folder with everything
  //     text = this.translateService.translate('databox.uploading_folder');
  //     // in folder mode, there is only on element in array, corresponding to the folder
  //     const folderTypingName = formValue.files[0].typingName;
  //     obs = this.fileResourceService.uploadFolder(folderTypingName, this.input.files);
  //   }
  //
  //
  //   const action: FlPortalAction = {
  //     text: text,
  //     type: LabFileResourceService.uploadFileActon,
  //     action: obs,
  //     trackHttpEvents: true,
  //   };
  //
  //   this.actionsService.addAction(action, false);
  // }

  get title(): string {
    return this.selectedNodes === 'files' ? 'databox.select_file_types' : 'databox.upload_folder';
  }

  get typePlaceholder(): string {
    return this.formGp.value.uploadMode === 'files' ? 'databox.select_file_type' : 'databox.select_folder_type';
  }
}
