import {Component, ElementRef, Inject, OnInit, ViewChild} from '@angular/core';
import {
  MAT_LEGACY_DIALOG_DATA as MAT_DIALOG_DATA,
  MatLegacyDialogRef as MatDialogRef
} from '@angular/material/legacy-dialog';
import {CaUser} from '../../../ca-core/model/entities/ca-user.class';
import {
  FlFormDialogAbstractDirective,
  FlFormDialogInput,
  FlImageHelper,
  FlSnackBarService
} from '@monorepo/front-core-lib';
import {Observable} from 'rxjs';
import {FormBuilder, FormGroup} from '@ngneat/reactive-forms';
import {Validators} from '@angular/forms';
import {CaAuthenticatedUserService} from '../../../ca-core/service-api/ca-authenticated-user.service';

@Component({
  selector: 'ca-user-profile-edit-dialog',
  templateUrl: './ca-user-profile-edit-dialog.component.html',
  styleUrls: ['./ca-user-profile-edit-dialog.component.scss']
})
export class CaUserProfileEditDialogComponent extends FlFormDialogAbstractDirective<Partial<CaUser>, CaUser>
  implements OnInit {

  @ViewChild('input') inputPhoto: ElementRef<HTMLInputElement>;
  editPhotoImgElement: HTMLImageElement;
  user: CaUser;
  isLoadingImport: boolean;
  newImageFile: File;
  errorFile: boolean;
  errorFileText: string;
  currentImgLink: string;
  photoDiv: HTMLDivElement;

  constructor(snackBarService: FlSnackBarService,
              dialogRef: MatDialogRef<CaUserProfileEditDialogComponent>,
              @Inject(MAT_DIALOG_DATA) dialogInput: FlFormDialogInput<Partial<CaUser>>,
              private authenticatedUserService: CaAuthenticatedUserService) {
    super(dialogInput, snackBarService, dialogRef);
    this.user = dialogInput.object as CaUser;
  }

  ngOnInit(): void {
    this.init();
  }

  buildForm(): FormGroup<Partial<CaUser>> {
    return new FormBuilder().group({
      id: [null],
      lastname: [{value: null}, Validators.required],
      firstname: [{value: null}, Validators.required],
      activity: [null],
      company: [null],
      biography: [null, Validators.max(500)],
      photo: [null],
    });
  }

  create(formValue: Partial<CaUser>): Observable<CaUser> {
    return undefined;
  }

  getCreateSuccessMessage(): string {
    return '';
  }

  getUpdateSuccessMessage(): string {
    return 'edit_user_success';
  }

  update(formValue: Partial<CaUser>): Observable<CaUser> {

    if (!this.isLoadingImport && !this.errorFile) {
      return this.authenticatedUserService.editUser(formValue, this.newImageFile);
    } else {
      return null;
    }

  }

  submit(): void {
    if (!this.isLoadingImport && !this.errorFile) {
      this.update(this.formGp.value).subscribe({
        next: newEntity => this.onSaveSuccess(newEntity, this.getUpdateSuccessMessage()),
        error: () => this.isLoading = false
      });
    }
  }

  onFileSelected($event: File | File[]): void {
    this.isLoadingImport = true;
    if ($event == null) {
      return;
    }
    if (typeof (FileReader) !== 'undefined') {
      const reader = new FileReader();

      reader.onload = async (e: any) => {
        const srcResult = e.target.result;
        if (srcResult) {
          await this.compressBlob(new Blob([srcResult]));
        } else {
          this.isLoadingImport = false;
          this.errorFile = true;
          this.errorFileText = 'file_not_image';
        }
      };

      reader.readAsArrayBuffer(($event as File));
    }
  }

  activeInput(event: Event): void {
    this.photoDiv = event.currentTarget as HTMLDivElement;
    if (this.user.photo) {
      this.editPhotoImgElement = this.photoDiv.querySelector('img');
      this.currentImgLink = this.editPhotoImgElement.src;
    }
    this.inputPhoto.nativeElement.click();
  }

  private async compressBlob(blob: Blob): Promise<void> {
    const b: Blob = await FlImageHelper.compressBlob(blob, 360, 360, 240, 240);

    if (this.editPhotoImgElement) {
      this.editPhotoImgElement.src = URL.createObjectURL(b);
    } else {

      this.editPhotoImgElement = this.photoDiv.querySelector('img');
      this.editPhotoImgElement.style.display = 'block';
      this.editPhotoImgElement.src = URL.createObjectURL(b);
    }
    this.addFile(new File([b], 'i.png', {type: 'image/png'}));
  }

  private addFile(file: File): void {
    this.newImageFile = file;
    this.isLoadingImport = false;
    this.formGp.updateValueAndValidity();
  }

}
