import {Component, Inject, OnInit} from '@angular/core';
import {FormBuilder, FormGroup} from '@ngneat/reactive-forms';
import {CaLabManagerBrickVersionDTO} from '../../../ca-core/model/entities/lab/ca-lab-manager.class';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {Validators} from '@angular/forms';


@Component({
  selector: 'ca-lab-instance-config-brick',
  templateUrl: './ca-lab-instance-config-brick.component.html',
  styleUrls: ['./ca-lab-instance-config-brick.component.scss']
})
export class CaLabInstanceConfigBrickComponent implements OnInit {

  formGp: FormGroup<CaLabManagerBrickVersionDTO>;

  minVersion: string;

  private isUpdate: boolean;

  constructor(@Inject(MAT_DIALOG_DATA) private brickVersionDTO: CaLabManagerBrickVersionDTO,
              private dialogRef: MatDialogRef<CaLabInstanceConfigBrickComponent>) {
  }

  ngOnInit(): void {
    this.isUpdate = this.brickVersionDTO != null;
    this.initForm();
  }

  private initForm(): void {
    this.formGp = new FormBuilder().group({
      name: [null, Validators.required],
      version: [null, Validators.required],
    });

    if (this.brickVersionDTO) {
      this.formGp.patchValue(this.brickVersionDTO);
      this.formGp.get('name').disable();
      this.minVersion = this.brickVersionDTO.version;
    }
  }

  submit(): void {
    if (this.formGp.valid) {
      this.dialogRef.close(this.formGp.getRawValue());
    }
  }

  get title(): string {
    return this.isUpdate ? 'lab_instance_update_brick' : 'lab_instance_add_brick';
  }

}
