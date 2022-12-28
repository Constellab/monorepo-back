import {Component, Inject, OnInit} from '@angular/core';
import {FlFormDialogAbstractDirective, FlFormDialogInput, FlSnackBarService} from '@monorepo/front-core-lib';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {FormBuilder, FormGroup} from '@ngneat/reactive-forms';
import {Observable} from 'rxjs';
import {Validators} from '@angular/forms';
import {CaCloudProviderService} from '../../../../service-api/ca-cloud-provider.service';
import {CaCloudProviderRegion} from '../../../../model/entities/ca-cloud-provider.class';

export type CaCloudProviderRegionFormDialogInput = FlFormDialogInput<CaCloudProviderRegion>;

@Component({
  selector: 'ca-bucket-region-form-dialog',
  templateUrl: './ca-cloud-provider-region-form-dialog.component.html',
  styleUrls: ['./ca-cloud-provider-region-form-dialog.component.scss']
})
export class CaCloudProviderRegionFormDialogComponent
  extends FlFormDialogAbstractDirective<Partial<CaCloudProviderRegion>, CaCloudProviderRegion>
  implements OnInit {


  constructor(@Inject(MAT_DIALOG_DATA) dialogInput: CaCloudProviderRegionFormDialogInput,
              private cloudProviderService: CaCloudProviderService,
              protected snackBarService: FlSnackBarService,
              protected dialogRef: MatDialogRef<CaCloudProviderRegionFormDialogComponent>) {
    super(dialogInput, snackBarService, dialogRef);
  }

  ngOnInit(): void {
    this.init();
  }

  buildForm(): FormGroup<Partial<CaCloudProviderRegion>> {
    return new FormBuilder().group({
      id: [null],
      technicalName: [null, Validators.required],
      endpoint: [null, Validators.required],
      cloudProvider: [null, Validators.required],
      city: [null, Validators.required],
    });
  }

  create(formValue: Partial<CaCloudProviderRegion>): Observable<CaCloudProviderRegion> {
    return this.cloudProviderService.createRegion(formValue);
  }

  getCreateSuccessMessage(): string {
    return 'cloud_provider_region_created';
  }

  getUpdateSuccessMessage(): string {
    return 'cloud_provider_region_updated';
  }

  update(formValue: Partial<CaCloudProviderRegion>): Observable<CaCloudProviderRegion> {
    return this.cloudProviderService.updateRegion(formValue);
  }

  get title(): string {
    return this.isCreateMode() ? 'create_cloud_provider_region' : 'update_cloud_provider_region';
  }


}
