import {Component, Inject, OnInit} from '@angular/core';
import {FormControl, Validators} from '@angular/forms';
import {MAT_LEGACY_DIALOG_DATA as MAT_DIALOG_DATA, MatLegacyDialogRef as MatDialogRef} from '@angular/material/legacy-dialog';
import {CaLabInstanceService} from '../../../ca-core/service-api/ca-lab-instance.service';
import {CaProject} from '../../../ca-core/model/entities/project/ca-project.class';
import {CaLabInstanceProject} from '../../../ca-core/model/entities/lab/ca-lab-instance-project.class';
import {FlSnackBarService} from '@monorepo/front-core-lib';

export interface CaLabInstanceAddProjectDialogInput {
  labInstanceId: string;
}

/**
 * Dialog to add a project to a lab instance
 */
@Component({
  selector: 'ca-lab-instance-add-project-dialog',
  templateUrl: './ca-lab-instance-add-project-dialog.component.html',
  styleUrls: ['./ca-lab-instance-add-project-dialog.component.scss']
})
export class CaLabInstanceAddProjectDialogComponent implements OnInit {

  formControl: FormControl;

  isLoading: boolean;

  constructor(@Inject(MAT_DIALOG_DATA) private input: CaLabInstanceAddProjectDialogInput,
              private labInstanceService: CaLabInstanceService,
              private dialogRef: MatDialogRef<CaLabInstanceAddProjectDialogComponent>,
              private snackBar: FlSnackBarService) {
  }

  ngOnInit(): void {
    this.formControl = new FormControl(null, Validators.required);
  }

  submit(): void {
    if (this.formControl.valid && !this.isLoading) {
      this.addProject(this.formControl.value);
    }
  }

  private addProject(project: CaProject): void {
    this.isLoading = true;
    this.labInstanceService.addProjectToLab(this.input.labInstanceId, project.id).subscribe({
      next: (labProject) => this.addProjectSuccess(labProject),
      error: () => this.isLoading = false
    });
  }

  private addProjectSuccess(labProject: CaLabInstanceProject): void {
    this.snackBar.openSuccessMessage({text: 'lab_project_created', translateText: true});
    this.isLoading = false;
    this.dialogRef.close(labProject);
  }
}


