import {Component, Inject, OnInit} from '@angular/core';
import {CaLabInstance} from '../../../../model/entities/ca-lab-instance.class';
import {FormBuilder, FormGroup} from '@ngneat/reactive-forms';
import {Observable} from 'rxjs';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {CaLabInstanceService} from '../../../../service-api/ca-lab-instance.service';
import {Validators} from '@angular/forms';
import {FlFormDialogAbstractDirective, FlFormDialogInput, FlSnackBarService} from '@monorepo/front-core-lib';

@Component({
  selector: 'ca-lab-instance-form-dialog',
  templateUrl: './ca-lab-instance-form-dialog.component.html',
  styleUrls: ['./ca-lab-instance-form-dialog.component.scss']
})
export class CaLabInstanceFormDialogComponent extends FlFormDialogAbstractDirective<Partial<CaLabInstance>, CaLabInstance>
  implements OnInit {

  constructor(snackBarService: FlSnackBarService,
              dialogRef: MatDialogRef<CaLabInstanceFormDialogComponent>,
              @Inject(MAT_DIALOG_DATA) dialogInput: FlFormDialogInput<CaLabInstance>,
              private labInstanceService: CaLabInstanceService) {
    super(dialogInput, snackBarService, dialogRef, 'create_lab_instance', 'update_lab_instance');
  }

  ngOnInit(): void {
    this.init();
  }

  get title(): string {
    return this.isCreateMode() ? 'create_lab_instance' : 'update_lab_instance';
  }


  buildForm(): FormGroup<Partial<CaLabInstance>> {
    return new FormBuilder().group({
      id: [null],
      name: [null],
      virtualHost: [null, [Validators.required]],
      serverInfo: [null, [Validators.required]],
      owner: [null, Validators.required],
      glabApiKey: [null],
      labManagerApiKey: [null],
      codelabToken: [null],
    });
  }

  create(formValue: Partial<CaLabInstance>): Observable<CaLabInstance> {
    return this.labInstanceService.create(formValue);
  }

  update(formValue: Partial<CaLabInstance>): Observable<CaLabInstance> {
    return this.labInstanceService.update(formValue);
  }

}
