import {Component, Inject, OnInit} from '@angular/core';
import {Validators} from '@angular/forms';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {CaProject, CaProjectLevel, CaProjectLevelStatus} from '../../../../model/entities/project/ca-project.class';
import {CaProjectService} from '../../../../service-api/ca-project.service';
import {FormBuilder, FormGroup} from '@ngneat/reactive-forms';
import {Observable} from 'rxjs';
import {
  FlFormDialogAbstractDirective,
  FlFormDialogInput,
  FlSnackBarService,
  FlTextEditorBasicConfig,
  FlTextEditorConfig
} from '@monorepo/front-core-lib';

export interface CaProjectFormDialogInput extends FlFormDialogInput<CaProject> {
  level: CaProjectLevel;
  parentId: string;
  parentLevel: CaProjectLevel;
}

/**
 * Dialog to create or update a project
 */
@Component({
  selector: 'ca-project-form-dialog',
  templateUrl: './ca-project-form-dialog.component.html',
  styleUrls: ['./ca-project-form-dialog.component.scss']
})
export class CaProjectFormDialogComponent extends FlFormDialogAbstractDirective<Partial<CaProject>, CaProject> implements OnInit {

  formGp: FormGroup<Partial<CaProject>>;

  isLoading: boolean = false;

  textEditorConfig: FlTextEditorConfig = new FlTextEditorBasicConfig();

  levelStatus = CaProjectLevelStatus;

  constructor(@Inject(MAT_DIALOG_DATA) protected dialogInput: CaProjectFormDialogInput,
              private projectService: CaProjectService,
              snackBarService: FlSnackBarService,
              dialogRef: MatDialogRef<CaProjectFormDialogComponent>) {
    super(dialogInput, snackBarService, dialogRef);
  }

  ngOnInit(): void {
    this.init();
  }

  buildForm(): FormGroup<Partial<CaProject>> {
    return new FormBuilder().group({
      id: [null],
      levelStatus: [
        {
          value: CaProjectLevelStatus.LEAF,
          // when work package we force the children to be leaf to limit hierarchy depth
          disabled: this.isUpdateMode() || this.parentIsWorkPackage}
        , Validators.required],
      code: [null, Validators.required],
      title: [null, Validators.required],
      startingDate: [null, Validators.required],
      endingDate: [null],
    });
  }

  create(formValue: Partial<CaProject>): Observable<CaProject> {
    if (this.dialogInput.level === CaProjectLevel.PROJECT) {
      return this.projectService.createProject(formValue);
    } else {
      return this.projectService.createSubProject(formValue, this.dialogInput.parentId);
    }
  }

  update(formValue: Partial<CaProject>): Observable<CaProject> {
    return this.projectService.update(formValue);
  }


  get title(): string {
    if (this.dialogInput.level === CaProjectLevel.PROJECT) {
      return this.isCreateMode() ? 'new_project' : 'update_project';
    } else {
      return this.isCreateMode() ? 'new_sub_project' : 'update_sub_project';
    }
  }

  getCreateSuccessMessage(): string {
    if (this.dialogInput.level === CaProjectLevel.PROJECT) {
      return 'project_created';
    } else {
      return 'sub_project_created';
    }
  }

  getUpdateSuccessMessage(): string {
    if (this.dialogInput.level === CaProjectLevel.PROJECT) {
      return 'project_updated';
    } else {
      return 'sub_project_updated';
    }
  }

  get parentIsWorkPackage(): boolean {
    return this.dialogInput.parentLevel === CaProjectLevel.WORK_PACKAGE;
  }
}
