import {Component, Inject, OnInit} from '@angular/core';
import {Observable} from 'rxjs';
import {FormControl} from '@ngneat/reactive-forms';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {Validators} from '@angular/forms';
import {FlGlobalValidators, FlSnackBarService} from '@monorepo/front-core-lib';

export interface UpdateStatusFormDialogInput<S> {
  statusEnum: any;
  currentStatus: S;
  title?: string;

  updateStatus(status: S): Observable<any>;

}

/**
 * Generic form dialog to update the status of an entity
 */
@Component({
  selector: 'gen-update-status-form-dialog',
  templateUrl: './update-status-form-dialog.component.html',
  styleUrls: ['./update-status-form-dialog.component.scss']
})
export class UpdateStatusFormDialogComponent implements OnInit {

  formControl: FormControl;
  enum: any;

  isLoading: boolean;

  constructor(private dialogRef: MatDialogRef<UpdateStatusFormDialogComponent>,
              @Inject(MAT_DIALOG_DATA) private dialogInput: UpdateStatusFormDialogInput<any>,
              private snackBarService: FlSnackBarService) {
    this.enum = dialogInput.statusEnum;
  }

  ngOnInit(): void {
    this.initForm();
  }

  private initForm(): void {
    // create form control with a validator to verify that the status has changed
    this.formControl = new FormControl<any, any>(this.dialogInput.currentStatus,
      [Validators.required, FlGlobalValidators.differentValue(this.dialogInput.currentStatus)]);
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
