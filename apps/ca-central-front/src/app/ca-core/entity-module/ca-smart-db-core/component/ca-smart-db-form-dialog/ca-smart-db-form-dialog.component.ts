import {Component, Inject, OnInit} from '@angular/core';
import {FlFormDialogAbstractDirective, FlFormDialogInput, FlSnackBarService} from '@monorepo/front-core-lib';
import {CaSmartDb, CaSmartDbForm} from '../../../../model/entities/ca-smart-db.entity';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {CaSmartDbService} from '../../../../service-api/ca-smart-db.service';
import {FormBuilder, FormGroup} from '@ngneat/reactive-forms';
import {Validators} from '@angular/forms';
import {Observable} from 'rxjs';

export type CaSmartDbFormDialogInput = FlFormDialogInput<CaSmartDbForm>;

@Component({
  selector: 'ca-smart-db-form-dialog',
  templateUrl: './ca-smart-db-form-dialog.component.html',
  styleUrls: ['./ca-smart-db-form-dialog.component.scss']
})
export class CaSmartDbFormDialogComponent extends FlFormDialogAbstractDirective<CaSmartDbForm, CaSmartDb>
  implements OnInit {

  constructor(@Inject(MAT_DIALOG_DATA) protected dialogInput: CaSmartDbFormDialogInput,
              private smartDbService: CaSmartDbService,
              snackBarService: FlSnackBarService,
              dialogRef: MatDialogRef<CaSmartDbFormDialogComponent>) {
    super(dialogInput, snackBarService, dialogRef);
  }

  ngOnInit(): void {
    this.init();
  }

  buildForm(): FormGroup<CaSmartDbForm> {
    return new FormBuilder().group({
      id: [null],
      name: [null, Validators.required],
      type: ['PRIVATE', Validators.required],
      group: [{value: null, disabled: this.isUpdateMode()}, Validators.required],
    });
  }

  create(formValue: CaSmartDbForm): Observable<CaSmartDb> {
    return this.smartDbService.create(formValue);
  }

  update(formValue: CaSmartDbForm): Observable<CaSmartDb> {
    return this.smartDbService.update(formValue);
  }


  get title(): string {
    return this.isCreateMode() ? 'smart_db.create' : 'smart_db.update';
  }

  getCreateSuccessMessage(): string {
    return 'smart_db.created';
  }

  getUpdateSuccessMessage(): string {
    return 'smart_db.updated';
  }
}
