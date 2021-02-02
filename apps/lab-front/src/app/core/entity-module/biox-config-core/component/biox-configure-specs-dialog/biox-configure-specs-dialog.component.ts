import {Component, Inject, OnInit} from '@angular/core';
import {FormGroup} from '@angular/forms';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {BioxConfigSpecs} from '../../../../model/entities/biox-config.entity';

export interface BioxConfigureSpecsDialogInput {
  // current config values
  currentConfig?: any;

  configSpecs: BioxConfigSpecs;
}


/**
 * Dialog to create a config based on a config spec
 */
@Component({
  selector: 'gen-biox-configure-specs-dialog',
  templateUrl: './biox-configure-specs-dialog.component.html',
  styleUrls: ['./biox-configure-specs-dialog.component.scss']
})
export class BioxConfigureSpecsDialogComponent implements OnInit {

  formGp: FormGroup;

  configSpecs: BioxConfigSpecs;
  currentConfig: any;

  constructor(@Inject(MAT_DIALOG_DATA) input: BioxConfigureSpecsDialogInput,
              private dialogRef: MatDialogRef<BioxConfigureSpecsDialogComponent>) {
    this.configSpecs = input.configSpecs;
    this.currentConfig = input.currentConfig;
  }

  ngOnInit(): void {
    this.formGp = new FormGroup({});
  }

  submit(): void {
    if (this.formGp.valid) {
      this.dialogRef.close(this.formGp.getRawValue());
    }
  }

}
