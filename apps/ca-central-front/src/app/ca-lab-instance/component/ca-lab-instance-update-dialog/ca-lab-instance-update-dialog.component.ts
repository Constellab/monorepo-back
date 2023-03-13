import {Component, Inject, OnInit} from '@angular/core';
import {FlSnackBarService} from '@monorepo/front-core-lib';
import {MAT_LEGACY_DIALOG_DATA as MAT_DIALOG_DATA, MatLegacyDialogRef as MatDialogRef} from '@angular/material/legacy-dialog';
import {CaLabInstanceService} from '../../../ca-core/service-api/ca-lab-instance.service';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {CaLabInstance, CaLabInstanceOnPremiseForm} from '../../../ca-core/model/entities/lab/ca-lab-instance.class';

export type LabInstanceUpdateDialogInput = CaLabInstanceOnPremiseForm;

/**
 * Accessible by lab owner to update lab information
 */
@Component({
  selector: 'ca-lab-instance-update-dialog',
  templateUrl: './ca-lab-instance-update-dialog.component.html',
  styleUrls: ['./ca-lab-instance-update-dialog.component.scss']
})
export class CaLabInstanceUpdateDialogComponent implements OnInit {

  formGp: FormGroup;

  maxNameLength = CaLabInstance.MAX_NAME_LENGTH;

  isLoading: boolean = false;

  constructor(private snackbarService: FlSnackBarService,
              @Inject(MAT_DIALOG_DATA) private input: LabInstanceUpdateDialogInput,
              private labInstanceService: CaLabInstanceService,
              private dialogRef: MatDialogRef<CaLabInstanceUpdateDialogComponent>,
              private formBuilder: FormBuilder) {
  }

  ngOnInit(): void {
    this.initForm();
  }

  private initForm(): void {
    this.formGp = this.formBuilder.group({
      id: [this.input.id, Validators.required],
      name: [this.input.name, Validators.required],
      onPremisePlatform: [this.input.onPremisePlatform],
    });
  }

  submit(): void {
    if (!this.isLoading && this.formGp.valid) {
      this.isLoading = true;
      this.labInstanceService.updateLab(this.formGp.value).subscribe(
        lab => this.onSuccess(lab),
        () => this.isLoading = false
      );
    }
  }

  private onSuccess(labInstance: CaLabInstance): void {
    this.snackbarService.openSuccessMessage({text: 'lab_name_updated', translateText: true});
    this.isLoading = false;
    this.dialogRef.close(labInstance);
  }

  isOnPremise(): boolean {
    return !!this.input.onPremisePlatform;
  }
}
