import {Component, Inject, OnInit} from '@angular/core';
import {UntypedFormGroup} from '@angular/forms';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {LabConfigData, LabConfigureSpecsForm} from '../../../../model/entities/lab-config.entity';
import {LabConfigureSpecsFormComponent} from '../lab-configure-specs-form/lab-configure-specs-form.component';

export interface LabConfigureSpecsFormDialogInput {
  configData: LabConfigData;
  title: string;
  submitButtonText: string;
}

/**
 * Dialog to create a config based on a config spec
 */
@Component({
  selector: 'lab-configure-specs-form-dialog',
  templateUrl: './lab-configure-specs-form-dialog.component.html',
  styleUrls: ['./lab-configure-specs-form-dialog.component.scss']
})
export class LabConfigureSpecsFormDialogComponent implements OnInit {

  formGp: UntypedFormGroup;

  input: LabConfigureSpecsFormDialogInput;
  configData: LabConfigData;


  constructor(@Inject(MAT_DIALOG_DATA) input: LabConfigureSpecsFormDialogInput,
              private dialogRef: MatDialogRef<LabConfigureSpecsFormDialogComponent>) {
    this.input = input;
  }

  ngOnInit(): void {
    this.buildFormGp(this.input.configData);
  }

  private buildFormGp(configData: LabConfigData): void {
    this.formGp = LabConfigureSpecsFormComponent.buildFormGroup(configData);
    this.configData = configData;
  }

  submit(): void {
    if (this.formGp.valid) {
      const value: LabConfigureSpecsForm = this.formGp.getRawValue();
      this.dialogRef.close({...value.public, ...value.protected});
    }
  }

}
