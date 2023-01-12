import {Component, Inject, OnInit} from '@angular/core';
import {FormControl} from '@ngneat/reactive-forms';
import {FlSnackBarService} from '@monorepo/front-core-lib';
import {
  MAT_LEGACY_DIALOG_DATA as MAT_DIALOG_DATA,
  MatLegacyDialogRef as MatDialogRef
} from '@angular/material/legacy-dialog';
import {CaLabInstanceService} from '../../../ca-core/service-api/ca-lab-instance.service';
import {Validators} from '@angular/forms';
import {CaLabInstance} from '../../../ca-core/model/entities/lab/ca-lab-instance.class';

export interface LabInstanceUpdateNameDialogInput {
  labInstanceId: string;
  name: string;
}

@Component({
  selector: 'ca-lab-instance-update-name-dialog',
  templateUrl: './ca-lab-instance-update-name-dialog.component.html',
  styleUrls: ['./ca-lab-instance-update-name-dialog.component.scss']
})
export class CaLabInstanceUpdateNameDialogComponent implements OnInit {

  formControl: FormControl<string>;

  isLoading: boolean = false;

  constructor(private snackbarService: FlSnackBarService,
              @Inject(MAT_DIALOG_DATA) private input: LabInstanceUpdateNameDialogInput,
              private labInstanceService: CaLabInstanceService,
              private dialogRef: MatDialogRef<CaLabInstanceUpdateNameDialogComponent>) {
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

  private onSuccess(labInstance: CaLabInstance): void {
    this.snackbarService.openSuccessMessage({text: 'lab_name_updated', translateText: true});
    this.isLoading = false;
    this.dialogRef.close(labInstance);
  }
}
