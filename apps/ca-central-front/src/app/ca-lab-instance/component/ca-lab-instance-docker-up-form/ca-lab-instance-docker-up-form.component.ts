import {Component, Inject, OnInit} from '@angular/core';
import {FormBuilder, FormGroup} from '@ngneat/reactive-forms';
import {CaLabComposeRestartOptions} from '../../../ca-core/model/entities/lab/ca-lab-manager.class';
import {MAT_LEGACY_DIALOG_DATA as MAT_DIALOG_DATA, MatLegacyDialogRef as MatDialogRef} from '@angular/material/legacy-dialog';

export interface CaLabInstanceDockerUpFormInput {
  mode: 'start' | 'restart';
}

/**
 * Form dialog to select options before running a compose up or restart
 */
@Component({
  selector: 'ca-lab-instance-docker-up-form',
  templateUrl: './ca-lab-instance-docker-up-form.component.html',
  styleUrls: ['./ca-lab-instance-docker-up-form.component.scss']
})
export class CaLabInstanceDockerUpFormComponent implements OnInit {

  formGp: FormGroup<CaLabComposeRestartOptions>;

  constructor(@Inject(MAT_DIALOG_DATA) private input: CaLabInstanceDockerUpFormInput,
              private dialogRef: MatDialogRef<CaLabInstanceDockerUpFormComponent>) {
  }

  ngOnInit(): void {
    this.initForm();
  }

  private initForm(): void {
    this.formGp = new FormBuilder().group({
      updateContainers: [false],
      pruneSystem: [true],
      destroyContainers: [false],
    });
  }

  submit(): void {
    if (this.formGp.valid) {
      this.dialogRef.close(this.formGp.getRawValue());
    }
  }

  get isRestart(): boolean {
    return this.input.mode === 'restart';
  }

  get title(): string{
    return this.input.mode === 'start' ? 'lab_manager_compose_up_form' : 'lab_manager_compose_restart_form';
  }
}
