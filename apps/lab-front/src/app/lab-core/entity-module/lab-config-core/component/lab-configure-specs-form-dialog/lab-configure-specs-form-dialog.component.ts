import {Component, Inject, OnInit} from '@angular/core';
import {UntypedFormGroup} from '@angular/forms';
import {LabConfig, LabConfigureSpecsForm} from '../../../../model/entities/lab-config.entity';
import {LabConfigureSpecsFormComponent} from '../lab-configure-specs-form/lab-configure-specs-form.component';
import {FlDynamicFieldConfigService, FlFormHelper} from '@monorepo/front-core-lib';
import {LabConfigureProcessDynamicField} from '../../lab-configure-process-dynamic-field.service';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';

export interface LabConfigureSpecsFormDialogInput {
  configData: LabConfig;
  title: string;
  submitButtonText: string;
  disabled?: boolean;
}

/**
 * Dialog to create a config based on a config spec
 */
@Component({
  selector: 'lab-configure-specs-form-dialog',
  templateUrl: './lab-configure-specs-form-dialog.component.html',
  styleUrls: ['./lab-configure-specs-form-dialog.component.scss'],
  providers: [
    // configure the dynamic field to support tags and other custom fields
    {provide: FlDynamicFieldConfigService, useClass: LabConfigureProcessDynamicField}
  ]
})
export class LabConfigureSpecsFormDialogComponent implements OnInit {

  formGp: UntypedFormGroup;

  input: LabConfigureSpecsFormDialogInput;
  configData: LabConfig;


  constructor(@Inject(MAT_DIALOG_DATA) input: LabConfigureSpecsFormDialogInput,
              private dialogRef: MatDialogRef<LabConfigureSpecsFormDialogComponent>) {
    this.input = input;
  }

  ngOnInit(): void {
    this.buildFormGp(this.input.configData);
  }

  private buildFormGp(configData: LabConfig): void {
    this.formGp = LabConfigureSpecsFormComponent.buildFormGroup(configData);

    if (this.input.disabled) {
      this.formGp.disable();
    }
    this.configData = configData;
  }

  submit(): void {
    if (this.formGp.valid) {
      const value: LabConfigureSpecsForm = this.formGp.getRawValue();
      this.dialogRef.close({...value.public, ...value.protected});
    } else {
      FlFormHelper.markAllAsTouched(this.formGp);
    }
  }

}
