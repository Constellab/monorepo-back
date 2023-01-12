import {Component, OnInit} from '@angular/core';
import {FormBuilder, FormGroup} from '@ngneat/reactive-forms';
import {CaLabComposeUpOptions} from '../../../ca-core/model/entities/lab/ca-lab-manager.class';
import {MatLegacyDialogRef as MatDialogRef} from '@angular/material/legacy-dialog';

/**
 * Form dialog to select options before running a compose up or restart
 */
@Component({
  selector: 'ca-lab-instance-docker-up-form',
  templateUrl: './ca-lab-instance-docker-up-form.component.html',
  styleUrls: ['./ca-lab-instance-docker-up-form.component.scss']
})
export class CaLabInstanceDockerUpFormComponent implements OnInit {

  formGp: FormGroup<CaLabComposeUpOptions>;

  constructor(private dialogRef: MatDialogRef<CaLabInstanceDockerUpFormComponent>) {
  }

  ngOnInit(): void {
    this.initForm();
  }

  private initForm(): void {
    this.formGp = new FormBuilder().group({
      updateBricks: [false],
      updateContainers: [false],
      pruneSystem: [true]
    });
  }

  submit(): void {
    if (this.formGp.valid) {
      this.dialogRef.close(this.formGp.getRawValue());
    }
  }
}
