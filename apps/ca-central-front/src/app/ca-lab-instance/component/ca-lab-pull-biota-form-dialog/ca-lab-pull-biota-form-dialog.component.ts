import {Component, OnInit} from '@angular/core';
import {MatDialogRef} from '@angular/material/dialog';
import {FormBuilder, FormGroup} from '@ngneat/reactive-forms';
import {CaLabPullBiotaOptions} from '../../../ca-core/model/entities/lab/ca-lab-manager.class';

@Component({
  selector: 'ca-lab-pull-biota-form-dialog',
  templateUrl: './ca-lab-pull-biota-form-dialog.component.html',
  styleUrls: ['./ca-lab-pull-biota-form-dialog.component.scss']
})
export class CaLabPullBiotaFormDialogComponent implements OnInit {

  formGp: FormGroup<CaLabPullBiotaOptions>;


  constructor(private dialogRef: MatDialogRef<CaLabPullBiotaFormDialogComponent>) {
  }

  ngOnInit(): void {
    this.initForm();
  }

  private initForm(): void {
    this.formGp = new FormBuilder().group({
      forceUpdate: [false],
    });
  }

  submit(): void {
    if (this.formGp.valid) {
      this.dialogRef.close(this.formGp.getRawValue());
    }
  }

}
