import {Component, OnInit} from '@angular/core';
import {FlFormDialogAbstractDirective, FlFormDialogInput, FlSnackBarService} from '@monorepo/front-core-lib';
import {HaBrickService} from '../../../../../../ha-core/ha-service/ha-brick.service';
import {MatDialogRef} from '@angular/material/dialog';
import {HaNewVersionDTO} from '../../../../../../ha-core/ha-model/ha-entities/ha-version.class';
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

  constructor(
    protected dialogInput: FlFormDialogInput<HaNewVersionDTO>,
    private brickService: HaBrickService,
    snackBarService: FlSnackBarService,
    dialogRef: MatDialogRef<HaPublicAddVersionDialogComponent>
  ) {
    super(dialogInput, snackBarService, dialogRef, 'new_version_added', null);
  }

  ngOnInit(): void {
    this.init();
    this.brickId = this.dialogInput.object.brickId;
  }

  buildForm(): FormGroup<Partial<HaNewVersionDTO>> {
    return new FormBuilder().group({
      version: [null, Validators.required],
      commit: [null],
      brickId: [null, Validators.required],
      repoType: [null, Validators.required]
    });
  }

  create(formValue: Partial<HaNewVersionDTO>): Observable<Partial<HaNewVersionDTO>> {
    this.formGp.value.brickId = this.brickId;
    console.log(this.formGp.value);
    return undefined;
  }

  update(formValue: Partial<HaNewVersionDTO>): Observable<Partial<HaNewVersionDTO>> {
    return undefined;
  }


}
