import {Component, Inject, OnInit} from '@angular/core';
import {FlFormDialogAbstractDirective, FlFormDialogInput, FlSnackBarService} from '@monorepo/front-core-lib';
import {HaBrickService} from '../../../../../ha-core/ha-service/ha-brick.service';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {HaNewVersionDTO} from '../../../../../ha-core/ha-model/ha-entities/ha-version.class';
import {FormBuilder, FormGroup} from '@ngneat/reactive-forms';
import {Observable} from 'rxjs';
import {Validators} from '@angular/forms';

@Component({
  selector: 'ha-public-add-version-dialog',
  templateUrl: './ha-public-add-version-dialog.component.html',
  styleUrls: ['./ha-public-add-version-dialog.component.scss']
})
export class HaPublicAddVersionDialogComponent extends FlFormDialogAbstractDirective<Partial<HaNewVersionDTO>> implements OnInit {

  isLoading: boolean = false;
  brickId: string;
  isUpdate: boolean = false;

  constructor(
    @Inject(MAT_DIALOG_DATA)
    protected dialogInput: FlFormDialogInput<HaNewVersionDTO>,
    private brickService: HaBrickService,
    snackBarService: FlSnackBarService,
    dialogRef: MatDialogRef<HaPublicAddVersionDialogComponent>
  ) {
    super(dialogInput, snackBarService, dialogRef, 'new_version_added', null);
  }

  ngOnInit(): void {
    this.isUpdate = this.dialogInput.mode == 'update';
    this.init();
    this.brickId = this.dialogInput.object.brickId;
  }

  buildForm(): FormGroup<Partial<HaNewVersionDTO>> {
    return new FormBuilder().group({
      version: [null, [Validators.required, Validators.pattern( new RegExp('^(\\d+\\.)(\\d+\\.)(\\*|\\d+)$'))]],
      brickId: [this.dialogInput.object.brickId, Validators.required],
      repoType: [null, Validators.required],
      isBeta: [false, Validators.required],
      subPatch: [null, [Validators.min(1)]]
    });
  }

  create(formValue: Partial<HaNewVersionDTO>): Observable<Partial<HaNewVersionDTO>> {
    formValue.brickId = this.brickId;
    if(formValue.isBeta){
      if(formValue.subPatch == null) return null;
      formValue.version = `${formValue.version}-beta${formValue.subPatch}`
    }
    return this.brickService.createNewVersion(formValue);
  }

  update(formValue: Partial<HaNewVersionDTO>): Observable<Partial<HaNewVersionDTO>> {
    return undefined;
  }


}
