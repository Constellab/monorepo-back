import {Component, Inject, OnInit} from '@angular/core';
import {FlFormDialogAbstractDirective, FlFormDialogInput, FlSnackBarService} from '@monorepo/front-core-lib';
import {CaCloudProvider} from '../../../../model/entities/ca-cloud-provider.class';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {CaCloudProviderService} from '../../../../service-api/ca-cloud-provider.service';
import {FormBuilder, FormGroup} from '@ngneat/reactive-forms';
import {Validators} from '@angular/forms';
import {Observable} from 'rxjs';

export type CaCloudProviderFormDialogInput = FlFormDialogInput<CaCloudProvider>;

/**
 * Dialog to create or update a cloud provider
 */
@Component({
  selector: 'ca-cloud-provider-form-dialog',
  templateUrl: './ca-cloud-provider-form-dialog.component.html',
  styleUrls: ['./ca-cloud-provider-form-dialog.component.scss']
})
export class CaCloudProviderFormDialogComponent extends FlFormDialogAbstractDirective<Partial<CaCloudProvider>, CaCloudProvider>
  implements OnInit {

  constructor(@Inject(MAT_DIALOG_DATA) dialogInput: CaCloudProviderFormDialogInput,
              private cloudProviderService: CaCloudProviderService,
              protected snackBarService: FlSnackBarService,
              protected dialogRef: MatDialogRef<CaCloudProviderFormDialogComponent>) {
    super(dialogInput, snackBarService, dialogRef);
  }

  ngOnInit(): void {
    this.init();
  }

  buildForm(): FormGroup<Partial<CaCloudProvider>> {
    return new FormBuilder().group({
      id: [null],
      name: [null, Validators.required],
    });
  }

  create(formValue: Partial<CaCloudProvider>): Observable<CaCloudProvider> {
    return this.cloudProviderService.create(formValue);
  }

  update(formValue: Partial<CaCloudProvider>): Observable<CaCloudProvider> {
    return this.cloudProviderService.update(formValue);
  }


  get title(): string {
    return this.isCreateMode() ? 'create_cloud_provider' : 'update_cloud_provider';
  }

  getCreateSuccessMessage(): string {
    return 'cloud_provider_created';
  }

  getUpdateSuccessMessage(): string {
    return 'cloud_provider_updated';
  }

}
