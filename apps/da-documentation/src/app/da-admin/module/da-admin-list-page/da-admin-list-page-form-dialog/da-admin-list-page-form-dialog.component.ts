import {Component, Inject, OnInit} from '@angular/core';
import {FlFormDialogAbstractDirective, FlFormDialogInput, FlSnackBarService} from '@monorepo/front-core-lib';
import {DaFolder, DaFolderDTO} from '../../../../da-core/da-model/da-entities/da-folder.class';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {DaFolderService} from '../../../../da-core/da-service/da-folder.service';
import {FormBuilder, FormGroup} from '@ngneat/reactive-forms';
import {Validators} from '@angular/forms';
import {Observable} from 'rxjs';

@Component({
  selector: 'da-da-admin-list-page-form-dialog',
  templateUrl: './da-admin-list-page-form-dialog.component.html',
  styleUrls: ['./da-admin-list-page-form-dialog.component.scss']
})
export class DaAdminListPageFormDialogComponent extends FlFormDialogAbstractDirective<DaFolderDTO, DaFolder> implements OnInit{

  folders: DaFolder[];

  constructor(@Inject(MAT_DIALOG_DATA)
              protected dialogInput: FlFormDialogInput<DaFolderDTO>,
              private folderService: DaFolderService,
              snackBarService: FlSnackBarService,
              dialogRef: MatDialogRef<DaAdminListPageFormDialogComponent>) {
    super(dialogInput, snackBarService, dialogRef, 'Folder created', 'Folder updated');
  }

  ngOnInit(): void {
    this.init();

    this.folderService.get().subscribe(folders => {
      this.folders = folders;
    });
  }

  buildForm(): FormGroup<DaFolderDTO> {
    return new FormBuilder().group({
      id: [null],
      title: [null, Validators.required],
      folderId: [null, Validators.required],
      path: [null, Validators.required],
      order: [null, Validators.required]
    });
  }

  create(formValue: DaFolderDTO): Observable<DaFolder> {
    return this.folderService.create(formValue);
  }

  update(formValue: DaFolderDTO): Observable<DaFolder> {
    return this.folderService.update(formValue);
  }
}
