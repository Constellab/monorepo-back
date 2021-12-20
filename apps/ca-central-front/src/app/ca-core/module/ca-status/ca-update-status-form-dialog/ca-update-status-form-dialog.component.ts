import {Component, Inject, OnInit} from '@angular/core';
import {Observable} from 'rxjs';
import {FormControl} from '@ngneat/reactive-forms';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {Validators} from '@angular/forms';
import {FlGlobalValidators, FlSnackBarService, FlStatus, FlStatusDict} from '@monorepo/front-core-lib';

export interface UpdateStatusFormDialogInput<S extends string> {
  statusDict: FlStatusDict<S>;
  currentStatus: FlStatus<S>;
  title?: string;

  updateStatus(status: S): Observable<any>;

}

/**
 * Generic form dialog to update the status of an entity
 */
@Component({
  selector: 'ca-update-status-form-dialog',
  templateUrl: './ca-update-status-form-dialog.component.html',
  styleUrls: ['./ca-update-status-form-dialog.component.scss']
})
export class CaUpdateStatusFormDialogComponent implements OnInit {

  formControl: FormControl;
  statusDict: FlStatusDict;

  isLoading: boolean;

  constructor(private dialogRef: MatDialogRef<CaUpdateStatusFormDialogComponent>,
              @Inject(MAT_DIALOG_DATA) private dialogInput: UpdateStatusFormDialogInput<any>,
              private snackBarService: FlSnackBarService) {
    this.statusDict = dialogInput.statusDict;
  }

  ngOnInit(): void {
    this.initForm();
  }

  private initForm(): void {
    // create form control with a validator to verify that the status has changed
    this.formControl = new FormControl<any, any>(this.dialogInput.currentStatus.value,
      [Validators.required, FlGlobalValidators.differentValue(this.dialogInput.currentStatus.value)]);
  }

  submit(): void {
    if (this.formControl.valid && !this.isLoading) {
      this.updateStatus(this.formControl.value);
    }
  }

  private updateStatus(status: any): void {
    this.isLoading = true;
    this.dialogInput.updateStatus(status).subscribe(
      entity => this.updateStatusSuccess(entity),
      () => this.isLoading = false
    );
  }

  private updateStatusSuccess(entity: any): void {
    this.snackBarService.openSuccessMessage('status_updated', true);

    this.isLoading = false;
    this.dialogRef.close(entity);
  }

  get title(): string {
    return this.dialogInput.title ?? 'update_status';
  }

}
