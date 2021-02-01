import {Component, Inject, OnInit} from '@angular/core';
import {FormGroup} from '@angular/forms';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {BioxConfigSpecs} from '../../../../model/entities/biox-config.entity';

/**
 * Dialog to create a config based on a config spec
 */
@Component({
  selector: 'gen-biox-configure-specs-dialog',
  templateUrl: './biox-configure-specs-dialog.component.html',
  styleUrls: ['./biox-configure-specs-dialog.component.scss']
})
export class BioxConfigureSpecsDialogComponent implements OnInit {

  formGp: FormGroup = new FormGroup({});

  configSpecs: BioxConfigSpecs;

  constructor(@Inject(MAT_DIALOG_DATA) configSpecs: BioxConfigSpecs,
              private dialogRef: MatDialogRef<BioxConfigureSpecsDialogComponent>) {
    this.configSpecs = configSpecs;
  }

  ngOnInit(): void {
  }

  submit(): void {
    if (this.formGp.valid) {
      this.dialogRef.close(this.formGp.getRawValue());
    }
  }

}
