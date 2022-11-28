import {Component, Inject, OnInit} from '@angular/core';
import {FlFormDialogAbstractDirective, FlFormDialogInput, FlSnackBarService} from '@monorepo/front-core-lib';
import {CaSpace, CaSaveSpaceDTO} from '../../../../model/entities/ca-space.class';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {FormBuilder, FormGroup} from '@ngneat/reactive-forms';
import {Validators} from '@angular/forms';
import {Observable} from 'rxjs';
import {CaSpaceService} from '../../../../service-api/ca-space.service';

@Component({
  selector: 'ca-space-form-dialog',
  templateUrl: './ca-space-form-dialog.component.html',
  styleUrls: ['./ca-space-form-dialog.component.scss']
})
export class CaSpaceFormDialogComponent extends FlFormDialogAbstractDirective<CaSaveSpaceDTO, CaSpace>
  implements OnInit {

  constructor(snackBarService: FlSnackBarService,
              dialogRef: MatDialogRef<CaSpaceFormDialogComponent>,
              @Inject(MAT_DIALOG_DATA) dialogInput: FlFormDialogInput<CaSaveSpaceDTO>,
              private spaceService: CaSpaceService) {
    super(dialogInput, snackBarService, dialogRef);
  }

  ngOnInit(): void {
    this.init();
  }

  get title(): string {
    return this.isCreateMode() ? 'create_space' : 'update_space';
  }


  buildForm(): FormGroup<CaSaveSpaceDTO> {
    return new FormBuilder().group({
      id: [null],
      name: [null, [Validators.required]],
      domain: [null, [Validators.required, Validators.pattern('^[a-zA-Z0-9-]*')]],
      nbLicenses: [null, [Validators.required]]
    });
  }

  create(formValue: CaSaveSpaceDTO): Observable<CaSpace> {
    return this.spaceService.create(formValue);
  }

  update(formValue: CaSaveSpaceDTO): Observable<CaSpace> {
    return this.spaceService.update(formValue);
  }

  getCreateSuccessMessage(): string {
    return 'space_created';
  }

  getUpdateSuccessMessage(): string {
    return 'space_updated';
  }


}
