import {Component, Inject, OnInit} from '@angular/core';
import {FormControl} from '@ngneat/reactive-forms';
import {FlSnackBarService} from '@monorepo/front-core-lib';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {LabInstanceService} from '../../../core/service-api/lab-instance.service';
import {Validators} from '@angular/forms';
import {LabInstance} from '../../../core/model/entities/lab-instance.class';

export interface LabInstanceUpdateNameDialogInput {
  labInstanceId: string;
  name: string;
}

@Component({
  selector: 'gen-lab-instance-update-name-dialog',
  templateUrl: './lab-instance-update-name-dialog.component.html',
  styleUrls: ['./lab-instance-update-name-dialog.component.scss']
})
export class LabInstanceUpdateNameDialogComponent implements OnInit {

  formControl: FormControl<string>;

  isLoading: boolean = false;

  constructor(private snackbarService: FlSnackBarService,
              @Inject(MAT_DIALOG_DATA) private input: LabInstanceUpdateNameDialogInput,
              private labInstanceService: LabInstanceService,
              private dialogRef: MatDialogRef<LabInstanceUpdateNameDialogComponent>) {
  }

  ngOnInit(): void {
    this.initForm();
  }

  private initForm(): void {
    this.formControl = new FormControl<string>(this.input.name, [Validators.required]);
  }

  submit(): void {
    if (!this.isLoading && this.formControl.valid) {
      this.labInstanceService.updateName(this.input.labInstanceId, this.formControl.value).subscribe(
        lab => this.onSuccess(lab)
      );
    }
  }

  private onSuccess(labInstance: LabInstance): void {
    this.snackbarService.openSuccessMessage('lab_name_updated', true);
    this.isLoading = false;
    this.dialogRef.close(labInstance);
  }
}
