import {Component, Inject, OnInit} from '@angular/core';
import {Observable} from 'rxjs';
import {CaUser} from '../../../../model/entities/ca-user.class';
import {MAT_LEGACY_DIALOG_DATA as MAT_DIALOG_DATA, MatLegacyDialogRef as MatDialogRef} from '@angular/material/legacy-dialog';
import {CaProjectService} from '../../../../service-api/ca-project.service';
import {FormControl, Validators} from '@angular/forms';
import {CaProject} from '../../../../model/entities/project/ca-project.class';
import {FlSnackBarService} from '@monorepo/front-core-lib';
import {ClHelpService} from '@monorepo/core-lib';

export interface CaUpdateProjectLeaderDialogInput {
  projectId: string;
  currentLeader: CaUser;
  users$: Observable<CaUser[]>;
}

/**
 * Dialog to update a project leader
 */
@Component({
  selector: 'ca-update-project-leader-dialog',
  templateUrl: './ca-update-project-leader-dialog.component.html',
  styleUrls: ['./ca-update-project-leader-dialog.component.scss']
})
export class CaUpdateProjectLeaderDialogComponent implements OnInit {

  formControl: FormControl;
  users$: Observable<CaUser[]>;

  isLoading: boolean = false;

  compareWith = ClHelpService.compareFnIds

  constructor(@Inject(MAT_DIALOG_DATA) private input: CaUpdateProjectLeaderDialogInput,
              private projectService: CaProjectService,
              private dialogRef: MatDialogRef<CaUpdateProjectLeaderDialogComponent>,
              private snackBarService: FlSnackBarService) {
  }

  ngOnInit(): void {
    this.users$ = this.input.users$;
    this.formControl = new FormControl<any>(this.input.currentLeader,
      [Validators.required]);
  }

  submit(): void {
    if (this.formControl.valid && !this.isLoading) {
      this.updateProjectLeader(this.formControl.value);
    }
  }

  private updateProjectLeader(newLeader: CaUser): void {
    this.isLoading = true;
    this.projectService.updateProjectLeader(this.input.projectId, newLeader.id).subscribe({
      next: project => this.updateSuccess(project),
      error: () => this.isLoading = false
    });
  }

  private updateSuccess(project: CaProject): void {
    this.snackBarService.openSuccessMessage({text: 'project_leader_changed', translateText: true});
    this.dialogRef.close(project.leader);
    this.isLoading = false;
  }
}
