import {Component, Inject, OnInit} from '@angular/core';
import {Validators} from '@angular/forms';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {CaProject} from '../../../../model/entities/ca-project.class';
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

  constructor(@Inject(MAT_DIALOG_DATA) dialogInput: FlFormDialogInput<CaProject>,
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
      code: [null, Validators.required],
      title: [null, Validators.required],
      description: [null],
      startingDate: [null, Validators.required],
      endingDate: [null],
    });
  }

  create(formValue: Partial<CaProject>): Observable<CaProject> {
    return this.projectService.create(formValue);
  }

  update(formValue: Partial<CaProject>): Observable<CaProject> {
    return this.projectService.update(formValue);
  }


  get title(): string {
    return this.isCreateMode() ? 'new_project' : 'update_project';
  }

  getCreateSuccessMessage(): string {
    return 'project_created';
  }

  getUpdateSuccessMessage(): string {
    return 'project_updated';
  }


}
