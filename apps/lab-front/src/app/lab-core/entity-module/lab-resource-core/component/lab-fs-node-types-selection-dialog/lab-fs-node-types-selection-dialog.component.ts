import {Component, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {LabFileResourceService} from '../../../../entity-service/lab-file-resource.service';
import {FlFileHelper} from '@monorepo/front-core-lib';
import {FormArray, FormBuilder, FormGroup} from '@ngneat/reactive-forms';
import {LabFileType} from '../../../../model/entities/resource/lab-file-type';
import {Validators} from '@angular/forms';
import {Observable} from 'rxjs';
import {LabTypingName} from '../../../../model/entities/lab-typing-name.class';
import {ClCachedObservable} from '@monorepo/core-lib';
import {LabTypeEntity} from '../../../../model/entities/lab-type/lab-type.entity';


export type LabFsNodeTypesSelectionDialogMode = 'files' | 'folder' | 'filesOrFolder';

export interface LabFsNodeTypesSelectionDialogInput {
  dialogMode: LabFsNodeTypesSelectionDialogMode;
  filenames: string[];
}


// object used in the form
interface LabForm {
  nodeMode: 'files' | 'folder';
  files: LabFsNodeWithType[];
}

interface LabFsNodeWithType {
  filename: string;
  typingName: string;
}

// object used in the form
export type LabFsNodeTypesSelectionDialogResult = LabFsNodeTypesFileDialogResult | UploadFsNodeTypeFolderResult;

export interface LabFsNodeTypesFileDialogResult {
  uploadMode: 'files';
  fileTypingNames: string[];
}

export interface UploadFsNodeTypeFolderResult {
  uploadMode: 'folder';
  folderTypingName: string;
}


/**
 * Dialog used to select type of multiple files or folder
 * If files --> it allows to select the file type for each uploaded file
 * If folder --> one mode like the one before and one mode to directly upload the folder
 */
@Component({
  selector: 'lab-fs-node-types-selection-dialog',
  templateUrl: './lab-fs-node-types-selection-dialog.component.html',
  styleUrls: ['./lab-fs-node-types-selection-dialog.component.scss']
})
export class LabFsNodeTypesSelectionDialogComponent implements OnInit {

  selectedNodes: LabFsNodeTypesSelectionDialogMode;

  formArray: FormArray<LabFsNodeWithType>;
  formGp: FormGroup<LabForm>;

  resourceTypes$: Observable<LabTypeEntity[]>;

  private fileTypes$: ClCachedObservable<LabFileType[]>;
  private folderTypes$: ClCachedObservable<LabTypeEntity[]>;

  constructor(@Inject(MAT_DIALOG_DATA) private input: LabFsNodeTypesSelectionDialogInput,
              private fileResourceService: LabFileResourceService,
              private dialogRef: MatDialogRef<LabFsNodeTypesSelectionDialogComponent>) {
    this.selectedNodes = input.dialogMode;
  }

  ngOnInit(): void {
    this.fileTypes$ = new ClCachedObservable(this.fileResourceService.getFileTypes());
    this.folderTypes$ = new ClCachedObservable(this.fileResourceService.getFolderTypes());
    this.buildForm();
    this.onNodeModeChange(this.formGp.value.nodeMode);
  }

  private buildForm(): void {
    this.formArray = new FormArray<LabFsNodeWithType>([]);
    this.formGp = new FormBuilder().group({
      nodeMode: this.selectedNodes === 'folder' ? 'folder' : 'files',
      files: this.formArray
    });
  }

  // show the selection of file types when the mode is not folder
  get showSelectFileTypes(): boolean {
    return this.formGp.getRawValue().nodeMode !== 'folder';
  }


  onNodeModeChange(mode: 'files' | 'folder'): void {
    this.formArray.clear();
    if (mode === 'files') {
      this.initFormFiles();
    } else {
      this.initFormFolder();
    }
  }

  private async initFormFiles(): Promise<void> {
    this.resourceTypes$ = this.fileTypes$.getObs();

    const fileTypes = await this.fileTypes$.toPromise();
    const filesWithType: LabFsNodeWithType[] = [];
    // detect the typing name automatically
    for (const filename of this.input.filenames) {
      // if file does not have a typing name, detect the file type
      const extension = FlFileHelper.getFileExtension(filename);

      const fileType: LabFileType = fileTypes.find(fileType => fileType.extensionIsSupported(extension));

      if (fileType != null) {
        filesWithType.push({filename: filename, typingName: fileType.typingName});
      } else {
        // set the file as default typing name
        filesWithType.push({filename: filename, typingName: LabTypingName.resource.file});
      }
    }

    for (const file of filesWithType) {
      this.addItemToFormArray(file);
    }
  }

  private initFormFolder(): void {
    this.resourceTypes$ = this.folderTypes$.getObs();

    this.addItemToFormArray({filename: null, typingName: LabTypingName.resource.folder});
  }

  private addItemToFormArray(fileWithType: LabFsNodeWithType): void {
    this.formArray.push(new FormBuilder().group({
      filename: [fileWithType.filename],
      typingName: [fileWithType.typingName, Validators.required]
    }) as FormGroup<LabFsNodeWithType>);
  }

  submit(): void {
    if (this.formGp.valid) {

      const formValue = this.formGp.getRawValue();

      const typingNames: string[] = formValue.files.map(file => file.typingName);

      if (formValue.nodeMode === 'files') {
        this.closeDialog({
          uploadMode: 'files',
          fileTypingNames: typingNames
        });
      } else {
        this.closeDialog({
          uploadMode: 'folder',
          folderTypingName: typingNames[0] // in folder mode there is only on typing name
        });
      }
    }
  }


  private closeDialog(result: LabFsNodeTypesSelectionDialogResult): void {
    this.dialogRef.close(result);
  }


  get title(): string {
    return this.selectedNodes === 'files' ? 'databox.select_file_types' : 'databox.upload_folder';
  }

  get typePlaceholder(): string {
    return this.formGp.value.nodeMode === 'files' ? 'databox.select_file_type' : 'databox.select_folder_type';
  }
}
