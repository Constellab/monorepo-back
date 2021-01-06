import {Component, Inject, OnInit} from '@angular/core';
import {FormDialogAbstractDirective} from '../../../../abstract-directive/form-dialog-abstract.directive';
import {LabInstance} from '../../../../model/entities/lab-instance.class';
import {FormBuilder, FormGroup} from '@ngneat/reactive-forms';
import {Observable} from 'rxjs';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {FormDialogInput} from '../../../../model/global/form.class';
import {SnackBarService} from '../../../../service/snack-bar.service';
import {LabInstanceService} from '../../../../service-api/lab-instance.service';
import {Validators} from '@angular/forms';

@Component({
  selector: 'gen-lab-instance-form-dialog',
  templateUrl: './lab-instance-form-dialog.component.html',
  styleUrls: ['./lab-instance-form-dialog.component.scss']
})
export class LabInstanceFormDialogComponent extends FormDialogAbstractDirective<Partial<LabInstance>, LabInstance>
  implements OnInit {

  constructor(@Inject(MAT_DIALOG_DATA) dialogInput: FormDialogInput<LabInstance>,
              private labInstanceService: LabInstanceService,
              snackBarService: SnackBarService,
              dialogRef: MatDialogRef<LabInstanceFormDialogComponent>) {
    super(dialogInput, snackBarService, dialogRef, 'create_lab_instance', 'update_lab_instance');
  }

  ngOnInit(): void {
    this.init();
  }

  get title(): string {
    return this.isCreateMode() ? 'create_lab_instance' : 'update_lab_instance';
  }


  buildForm(): FormGroup<Partial<LabInstance>> {
    return new FormBuilder().group({
      id: [null],
      ip: [null, Validators.required],
      ipv6: [null],
      url: [null, [Validators.required, Validators.min(0)]],
      serverInfo: [null, [Validators.required]],
      owner: [null, Validators.required],
      lab: [{value: null, disabled: this.isUpdateMode()}, Validators.required]
    });
  }

  create(formValue: Partial<LabInstance>): Observable<LabInstance> {
    return this.labInstanceService.create(formValue);
  }

  update(formValue: Partial<LabInstance>): Observable<LabInstance> {
    return this.labInstanceService.update(formValue);
  }

}
