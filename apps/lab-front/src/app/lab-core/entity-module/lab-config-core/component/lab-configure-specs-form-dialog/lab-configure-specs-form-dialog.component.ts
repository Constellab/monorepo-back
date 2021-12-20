import {Component, Inject, OnInit} from '@angular/core';
import {FormGroup} from '@angular/forms';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {LabConfigData} from '../../../../model/entities/lab-config.entity';
import {
  LabConfigureSpecsForm,
  LabConfigureSpecsFormComponent
} from '../lab-configure-specs-form/lab-configure-specs-form.component';


/**
 * Dialog to create a config based on a config spec
 */
@Component({
  selector: 'lab-configure-specs-form-dialog',
  templateUrl: './lab-configure-specs-form-dialog.component.html',
  styleUrls: ['./lab-configure-specs-form-dialog.component.scss']
})
export class LabConfigureSpecsFormDialogComponent implements OnInit {

  formGp: FormGroup;

  configData: LabConfigData;

  constructor(@Inject(MAT_DIALOG_DATA) input: LabConfigData,
              private dialogRef: MatDialogRef<LabConfigureSpecsFormDialogComponent>) {
    this.configData = input;
  }

  ngOnInit(): void {
    this.formGp = LabConfigureSpecsFormComponent.buildFormGroup(this.configData);
  }

  submit(): void {
    if (this.formGp.valid) {
      const value: LabConfigureSpecsForm = this.formGp.getRawValue();
      this.dialogRef.close({...value.public, ...value.protected});
    }
  }

}
