import {Component, Inject, OnInit} from '@angular/core';
import {
  FlFormDialogAbstractDirective,
  FlFormDialogInput,
  FlGlobalValidators,
  FlSnackBarService
} from '@monorepo/front-core-lib';
import {HaFolder, HaFolderDTO} from '../../../../ha-core/ha-model/ha-entities/ha-folder.class';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {HaFolderService} from '../../../../ha-core/ha-service/ha-folder.service';
import {FormBuilder, FormGroup} from '@ngneat/reactive-forms';
import {Validators} from '@angular/forms';
import {Observable} from 'rxjs';

@Component({
  selector: 'ha-admin-list-page-form-dialog',
  templateUrl: './ha-admin-list-page-form-dialog.component.html',
  styleUrls: ['./ha-admin-list-page-form-dialog.component.scss']
})
export class HaAdminListPageFormDialogComponent extends FlFormDialogAbstractDirective<Partial<HaFolder>> implements OnInit{

  folders: HaFolder[];

  constructor(@Inject(MAT_DIALOG_DATA)
              protected dialogInput: FlFormDialogInput<HaFolderDTO>,
              private folderService: HaFolderService,
              snackBarService: FlSnackBarService,
              dialogRef: MatDialogRef<HaAdminListPageFormDialogComponent>) {
    super(dialogInput, snackBarService, dialogRef, 'folder_created', 'folder_updated');
  }

  ngOnInit(): void {
    this.init();

    this.folderService.get().subscribe(folders => {
      this.folders = folders;
    });
  }

  buildForm(): FormGroup<Partial<HaFolderDTO>> {
    return new FormBuilder().group({
      id: [null],
      title: [null, Validators.required],
      folderId: [null, Validators.required],
      path: [null, [Validators.required, Validators.pattern('^[a-z0-9A-Z-]+$')]],
      order: [null, [Validators.required, Validators.min(0), FlGlobalValidators.isInteger()]]
    });
  }

  create(formValue: HaFolderDTO): Observable<HaFolder> {
    return this.folderService.create(formValue);
  }

  update(formValue: HaFolderDTO): Observable<HaFolder> {
    return this.folderService.update(formValue);
  }
}
