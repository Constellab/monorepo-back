import {Component, Inject, OnInit} from '@angular/core';
import {CaLab} from '../../../../model/entities/ca-lab.class';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {CaLabService} from '../../../../service-api/ca-lab.service';
import {FormBuilder, FormGroup} from '@ngneat/reactive-forms';
import {Validators} from '@angular/forms';
import {Observable} from 'rxjs';
import {FlFormDialogAbstractDirective, FlFormDialogInput, FlSnackBarService} from '@monorepo/front-core-lib';

@Component({
  selector: 'ca-lab-form-dialog',
  templateUrl: './ca-lab-form-dialog.component.html',
  styleUrls: ['./ca-lab-form-dialog.component.scss']
})
export class CaLabFormDialogComponent extends FlFormDialogAbstractDirective<Partial<CaLab>, CaLab> implements OnInit {

  constructor(@Inject(MAT_DIALOG_DATA) dialogInput: FlFormDialogInput<CaLab>,
              private labService: CaLabService,
              snackBarService: FlSnackBarService,
              dialogRef: MatDialogRef<CaLabFormDialogComponent>) {
    super(dialogInput, snackBarService, dialogRef, 'lab_created', 'lab_updated');
  }

  ngOnInit(): void {
    this.init();
  }

  get title(): string {
    return this.isCreateMode() ? 'create_lab_instance' : 'update_lab_instance';
  }


  buildForm(): FormGroup<Partial<CaLab>> {
    return new FormBuilder().group({
      id: [null],
      label: [null, Validators.required],
    });
  }

  create(formValue: Partial<CaLab>): Observable<CaLab> {
    return this.labService.create(formValue);
  }

  update(formValue: Partial<CaLab>): Observable<CaLab> {
    return this.labService.update(formValue);
  }

}
