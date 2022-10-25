import {Component, Inject, OnInit} from '@angular/core';
import {CaOrganization} from '../../../../ca-core/model/entities/ca-organization.class';
import {FormControl, Validators} from '@angular/forms';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {CaOrganizationService} from '../../../../ca-core/service-api/ca-organization.service';
import {FlSnackBarService} from '@monorepo/front-core-lib';


export interface CaOrganizationUploadPhotoDialogInput {
  organizationId: string;
}

@Component({
  selector: 'ca-organization-upload-photo-dialog',
  templateUrl: './ca-organization-upload-photo-dialog.component.html',
  styleUrls: ['./ca-organization-upload-photo-dialog.component.scss']
})
export class CaOrganizationUploadPhotoDialogComponent implements OnInit {

  formControl: FormControl;

  isLoading: boolean = false;

  constructor(@Inject(MAT_DIALOG_DATA) private input: CaOrganizationUploadPhotoDialogInput,
              private dialogRef: MatDialogRef<CaOrganizationUploadPhotoDialogComponent>,
              private organizationService: CaOrganizationService,
              private snackBarService: FlSnackBarService) {
  }

  ngOnInit(): void {
    this.formControl = new FormControl<any>(null, [Validators.required]);
  }

  submit(): void {
    if (this.formControl.valid && !this.isLoading) {
      this.uploadPhoto(this.formControl.value);
    }
  }

  private uploadPhoto(file: File): void {
    this.isLoading = true;
    // TODO resize the image
    this.organizationService.uploadOrganizationPhoto(this.input.organizationId, file).subscribe({
      next: (organization) => this.updatePhotoSuccess(organization),
      error: () => this.isLoading = false
    });

  }

  private updatePhotoSuccess(organization: CaOrganization): void {
    this.snackBarService.openSuccessMessage({text: 'organization_photo_uploaded', translateText: true});
    this.dialogRef.close(organization);
  }

}
