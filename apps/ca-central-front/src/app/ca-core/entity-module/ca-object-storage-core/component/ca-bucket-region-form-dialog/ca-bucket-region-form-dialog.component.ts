import {Component, Inject, OnInit} from '@angular/core';
import {FlFormDialogAbstractDirective, FlFormDialogInput, FlSnackBarService} from '@monorepo/front-core-lib';
import {CaBucketRegion} from '../../../../model/entities/ca-object-storage.class';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {CaObjectStorageService} from '../../../../service-api/ca-object-storage.service';
import {FormBuilder, FormGroup} from '@ngneat/reactive-forms';
import {Observable} from 'rxjs';
import {Validators} from '@angular/forms';

export type CaBucketRegionFormDialogInput = FlFormDialogInput<CaBucketRegion>;

@Component({
  selector: 'ca-bucket-region-form-dialog',
  templateUrl: './ca-bucket-region-form-dialog.component.html',
  styleUrls: ['./ca-bucket-region-form-dialog.component.scss']
})
export class CaBucketRegionFormDialogComponent
  extends FlFormDialogAbstractDirective<Partial<CaBucketRegion>, CaBucketRegion>
  implements OnInit {


  constructor(@Inject(MAT_DIALOG_DATA) dialogInput: CaBucketRegionFormDialogInput,
              private objectStorageService: CaObjectStorageService,
              protected snackBarService: FlSnackBarService,
              protected dialogRef: MatDialogRef<CaBucketRegionFormDialogComponent>) {
    super(dialogInput, snackBarService, dialogRef);
  }

  ngOnInit(): void {
    this.init();
  }

  buildForm(): FormGroup<Partial<CaBucketRegion>> {
    return new FormBuilder().group({
      id: [null],
      technicalName: [null, Validators.required],
      endpoint: [null, Validators.required],
      cloudProvider: [null, Validators.required],
      city: [null, Validators.required],
    });
  }

  create(formValue: Partial<CaBucketRegion>): Observable<CaBucketRegion> {
    return this.objectStorageService.createRegion(formValue);
  }

  getCreateSuccessMessage(): string {
    return 'bucket_region_created';
  }

  getUpdateSuccessMessage(): string {
    return 'bucket_region_updated';
  }

  update(formValue: Partial<CaBucketRegion>): Observable<CaBucketRegion> {
    return this.objectStorageService.updateRegion(formValue);
  }

  get title(): string {
    return this.isCreateMode() ? 'create_bucket_region' : 'update_bucket_region';
  }


}
