import {Component, Inject, OnInit} from '@angular/core';
import {LabBrickService} from '../../../../lab-core/entity-service/lab-brick.service';
import {Observable} from 'rxjs';
import {LabBrickMigration} from '../../../../lab-core/model/entities/lab-brick.entity';
import {FormControl} from '@ngneat/reactive-forms';
import {Validators} from '@angular/forms';
import {CmVersion} from '@monorepo/common-model';
import {FlSnackBarService} from '@monorepo/front-core-lib';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';

/**
 * Dialog to list available migration a call them manually
 */
@Component({
  selector: 'lab-brick-call-migration-dialog',
  templateUrl: './lab-brick-call-migration-dialog.component.html',
  styleUrls: ['./lab-brick-call-migration-dialog.component.scss']
})
export class LabBrickCallMigrationDialogComponent implements OnInit {

  brickMigrations$: Observable<LabBrickMigration[]>;

  formControl: FormControl<CmVersion>;

  isLoading: boolean = false;

  constructor(@Inject(MAT_DIALOG_DATA) private brickName: string,
              private dialogRef: MatDialogRef<LabBrickCallMigrationDialogComponent>,
              private brickService: LabBrickService,
              private snackBarService: FlSnackBarService) {
  }

  ngOnInit(): void {
    this.brickMigrations$ = this.brickService.getBrickMigrations(this.brickName);
    this.formControl = new FormControl(null, Validators.required);
  }

  submit(): void {
    if (!this.isLoading && this.formControl.valid) {
      this.callMigration(this.formControl.value);
    }
  }

  private callMigration(version: CmVersion): void {
    this.isLoading = true;

    this.brickService.callMigration(this.brickName, version.toString()).subscribe(
      {
        next: () => this.onSuccess(),
        error: () => this.isLoading = false
      });
  }

  private onSuccess(): void {
    this.snackBarService.openSuccessMessage({text: 'monitoring.call_migration_success', translateText: true});
    this.isLoading = false;
    this.dialogRef.close();
  }


}
