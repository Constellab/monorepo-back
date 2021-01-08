import {Component, Inject, OnInit} from '@angular/core';
import {Validators} from '@angular/forms';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {Project} from '../../../../model/entities/project.class';
import {ProjectService} from '../../../../../dashboard/service/project.service';
import {FormBuilder, FormGroup} from '@ngneat/reactive-forms';
import {Observable} from 'rxjs';
import {FlFormDialogAbstractDirective, FlFormDialogInput, FlSnackBarService} from '@monorepo/front-core-lib';

/**
 * Dialog to create or update a project
 */
@Component({
  selector: 'gen-project-form-dialog',
  templateUrl: './project-form-dialog.component.html',
  styleUrls: ['./project-form-dialog.component.scss']
})
export class ProjectFormDialogComponent extends FlFormDialogAbstractDirective<Partial<Project>, Project> implements OnInit {

  formGp: FormGroup<Partial<Project>>;

  isLoading: boolean = false;

  constructor(@Inject(MAT_DIALOG_DATA) dialogInput: FlFormDialogInput<Project>,
              private projectService: ProjectService,
              snackBarService: FlSnackBarService,
              dialogRef: MatDialogRef<ProjectFormDialogComponent>) {
    super(dialogInput, snackBarService, dialogRef, 'project_created', 'project_updated');
  }

  ngOnInit(): void {
    this.init();
  }

  buildForm(): FormGroup<Partial<Project>> {
    return new FormBuilder().group({
      id: [null],
      code: [null, Validators.required],
      title: [null, Validators.required],
      description: [null],
      startingDate: [null, Validators.required],
      endingDate: [null],
    });
  }

  create(formValue: Partial<Project>): Observable<Project> {
    return this.projectService.create(formValue);
  }

  update(formValue: Partial<Project>): Observable<Project> {
    return this.projectService.update(formValue);
  }


  get title(): string {
    return this.isCreateMode() ? 'new_project' : 'update_project';
  }

}
