import {Component, Inject, OnInit} from '@angular/core';
import {CaSpace} from '../../../../ca-core/model/entities/space/ca-space.class';
import {FormControl, Validators} from '@angular/forms';
import {
  MAT_LEGACY_DIALOG_DATA as MAT_DIALOG_DATA,
  MatLegacyDialogRef as MatDialogRef
} from '@angular/material/legacy-dialog';
import {CaSpaceService} from '../../../../ca-core/service-api/ca-space.service';
import {FlSnackBarService} from '@monorepo/front-core-lib';


export interface CaSpaceUploadPhotoDialogInput {
  spaceId: string;
}

@Component({
  selector: 'ca-space-upload-photo-dialog',
  templateUrl: './ca-space-upload-photo-dialog.component.html',
  styleUrls: ['./ca-space-upload-photo-dialog.component.scss']
})
export class CaSpaceUploadPhotoDialogComponent implements OnInit {

  formControl: FormControl;

  isLoading: boolean = false;

  constructor(@Inject(MAT_DIALOG_DATA) private input: CaSpaceUploadPhotoDialogInput,
              private dialogRef: MatDialogRef<CaSpaceUploadPhotoDialogComponent>,
              private spaceService: CaSpaceService,
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
    this.spaceService.uploadSpacePhoto(this.input.spaceId, file).subscribe({
      next: (space) => this.updatePhotoSuccess(space),
      error: () => this.isLoading = false
    });

  }

  private updatePhotoSuccess(space: CaSpace): void {
    this.snackBarService.openSuccessMessage({text: 'space_photo_uploaded', translateText: true});
    this.dialogRef.close(space);
  }

}
