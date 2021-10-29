import {Component, Inject, OnInit} from '@angular/core';
import {FormGroup} from '@angular/forms';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {BioxConfigData} from '../../../../model/entities/biox-config.entity';
import {BioxConfigValue} from '../biox-configure-specs-form/biox-configure-specs-form.component';


/**
 * Dialog to create a config based on a config spec
 */
@Component({
  selector: 'gen-biox-configure-specs-form-dialog',
  templateUrl: './biox-configure-specs-form-dialog.component.html',
  styleUrls: ['./biox-configure-specs-form-dialog.component.scss']
})
export class BioxConfigureSpecsFormDialogComponent implements OnInit {

  formGp: FormGroup;

  bioxConfigData: BioxConfigData;

  constructor(@Inject(MAT_DIALOG_DATA) input: BioxConfigData,
              private dialogRef: MatDialogRef<BioxConfigureSpecsFormDialogComponent>) {
    this.bioxConfigData = input;
  }

  ngOnInit(): void {
    this.formGp = new FormGroup({});
  }

  submit(): void {
    if (this.formGp.valid) {
      const value: BioxConfigValue = this.formGp.getRawValue();
      this.dialogRef.close({...value.public, ...value.protected});
    }
  }

}
