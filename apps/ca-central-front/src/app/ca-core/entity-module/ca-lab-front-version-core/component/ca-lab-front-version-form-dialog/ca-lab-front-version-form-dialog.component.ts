import {Component, Inject, OnInit} from '@angular/core';
import {FlFormDialogAbstractDirective, FlFormDialogInput, FlSnackBarService} from '@monorepo/front-core-lib';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {FormBuilder, FormGroup} from '@ngneat/reactive-forms';
import {Validators} from '@angular/forms';
import {Observable} from 'rxjs';
import {CaLabFrontVersion, CaSaveLabFrontVersionDTO} from '../../../../model/entities/ca-lab-front-version.class';
import {CaLabFrontVersionService} from '../../../../service-api/ca-lab-front-version.service';
import {CaBrickGWS} from '../../../../model/entities/ca-brick.class';

@Component({
  selector: 'ca-lab-front-version-form-dialog',
  templateUrl: './ca-lab-front-version-form-dialog.component.html',
  styleUrls: ['./ca-lab-front-version-form-dialog.component.scss']
})
export class CaLabFrontVersionFormDialogComponent extends FlFormDialogAbstractDirective<CaSaveLabFrontVersionDTO, CaLabFrontVersion>
  implements OnInit {

  gwsCoreBrick = CaBrickGWS.GWS_CORE;

  constructor(snackBarService: FlSnackBarService,
              dialogRef: MatDialogRef<CaLabFrontVersionFormDialogComponent>,
              @Inject(MAT_DIALOG_DATA) dialogInput: FlFormDialogInput<CaLabFrontVersion>,
              private labInstanceService: CaLabFrontVersionService) {
    super(dialogInput, snackBarService, dialogRef, 'lab_front_version_created', 'lab_front_version_updated');
  }

  ngOnInit(): void {
    this.init();
  }

  get title(): string {
    return this.isCreateMode() ? 'create_lab_front_version' : 'update_lab_front_version';
  }


  buildForm(): FormGroup<CaSaveLabFrontVersionDTO> {
    return new FormBuilder().group({
      id: [null],
      version: [null, [Validators.required]],
      gwsCoreBrickVersion: [null, [Validators.required]]
    });
  }

  create(formValue: CaSaveLabFrontVersionDTO): Observable<CaLabFrontVersion> {
    return this.labInstanceService.create(formValue);
  }

  update(formValue: CaSaveLabFrontVersionDTO): Observable<CaLabFrontVersion> {
    return this.labInstanceService.update(formValue);
  }

}
