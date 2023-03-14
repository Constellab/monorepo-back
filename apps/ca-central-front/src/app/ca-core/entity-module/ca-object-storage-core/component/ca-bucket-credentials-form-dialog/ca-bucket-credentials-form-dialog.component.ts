import {Component, Inject, OnInit} from '@angular/core';
import {FlFormDialogAbstractDirective, FlFormDialogInput, FlSnackBarService} from '@monorepo/front-core-lib';
import {CaBucketCredentialsFull} from '../../../../model/entities/ca-object-storage.class';
import {
  CaCloudProviderFormDialogInput
} from '../../../ca-cloud-provider-core/component/ca-cloud-provider-form-dialog/ca-cloud-provider-form-dialog.component';
import {CaObjectStorageService} from '../../../../service-api/ca-object-storage.service';
import {Observable} from 'rxjs';
import {FormBuilder, FormGroup} from '@ngneat/reactive-forms';
import {Validators} from '@angular/forms';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';

export type CaBucketCredentialsFormDialogInput = FlFormDialogInput<CaBucketCredentialsFull>;

@Component({
  selector: 'ca-bucket-credentials-form-dialog',
  templateUrl: './ca-bucket-credentials-form-dialog.component.html',
  styleUrls: ['./ca-bucket-credentials-form-dialog.component.scss']
})
export class CaBucketCredentialsFormDialogComponent
  extends FlFormDialogAbstractDirective<Partial<CaBucketCredentialsFull>, CaBucketCredentialsFull>
  implements OnInit {

  constructor(@Inject(MAT_DIALOG_DATA) dialogInput: CaCloudProviderFormDialogInput,
              private objectStorageService: CaObjectStorageService,
              protected snackBarService: FlSnackBarService,
              protected dialogRef: MatDialogRef<CaBucketCredentialsFormDialogComponent>) {
    super(dialogInput, snackBarService, dialogRef);
  }


  ngOnInit(): void {
    this.init();
  }

  buildForm(): FormGroup<Partial<CaBucketCredentialsFull>> {
    return new FormBuilder().group({
      id: [null],
      name: [null, Validators.required],
      accessKeyId: [null, Validators.required],
      secretAccessKey: [null, Validators.required],
      cloudProvider: [null, Validators.required],
      space: [null],
      s3Username: [null],
      shortDescription: [null],
    });
  }

  create(formValue: Partial<CaBucketCredentialsFull>): Observable<CaBucketCredentialsFull> {
    return this.objectStorageService.createCredentials(formValue);
  }

  getCreateSuccessMessage(): string {
    return 'bucket_credentials_created';
  }

  getUpdateSuccessMessage(): string {
    return 'bucket_credentials_updated';
  }

  update(formValue: Partial<CaBucketCredentialsFull>): Observable<CaBucketCredentialsFull> {
    return this.objectStorageService.updateCredentials(formValue);
  }

  get title(): string {
    return this.isCreateMode() ? 'create_bucket_credentials' : 'update_bucket_credentials';
  }


}
