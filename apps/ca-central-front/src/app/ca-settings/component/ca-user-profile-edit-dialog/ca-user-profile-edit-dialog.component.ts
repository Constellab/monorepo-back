import {Component, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {CaUser} from '../../../ca-core/model/entities/ca-user.class';
import {FlFormDialogAbstractDirective, FlFormDialogInput, FlSnackBarService} from '@monorepo/front-core-lib';
import {Observable} from 'rxjs';
import {FormBuilder, FormGroup} from '@ngneat/reactive-forms';
import {Validators} from '@angular/forms';
import {marked} from 'marked';
import {CaUsersService} from '../../../ca-core/service-api/ca-users.service';
import Image = marked.Tokens.Image;

@Component({
  selector: 'ca-user-profile-edit-dialog',
  templateUrl: './ca-user-profile-edit-dialog.component.html',
  styleUrls: ['./ca-user-profile-edit-dialog.component.scss']
})
export class CaUserProfileEditDialogComponent extends FlFormDialogAbstractDirective<Partial<CaUser>, CaUser>
  implements OnInit {

  user: CaUser;
  isLoadingImport: boolean;
  newImageFile: File;
  errorFile: boolean;
  errorFileText: string;
  editPhotoImgElement: HTMLImageElement;
  currentImgLink: string;
  photoDiv: HTMLDivElement;

  constructor(
    snackBarService: FlSnackBarService,
    dialogRef: MatDialogRef<CaUserProfileEditDialogComponent>,
    @Inject(MAT_DIALOG_DATA) dialogInput: FlFormDialogInput<Partial<CaUser>>,
    private userService: CaUsersService
  ) {
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
      job: [null],
      company: [null],
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
      return this.userService.editUser(formValue, this.newImageFile);
    } else {
      return null;
    }

  }

  submit(): void {
    if (!this.isLoadingImport && !this.errorFile) {
      this.update(this.formGp.value).subscribe({
        next: newEntity => {
          console.log(newEntity)
          this.onSaveSuccess(newEntity, this.getUpdateSuccessMessage())
        },
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

      reader.onload = (e: any) => {
        const srcResult = e.target.result;
        if (srcResult) {
          this.compressBlob(new Blob([srcResult]));
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
    const inputPhoto: HTMLInputElement = this.photoDiv.querySelector('input');
    if(this.user.photo){
      this.editPhotoImgElement = this.photoDiv.querySelector('img');
      this.currentImgLink = this.editPhotoImgElement.src;
    }
    inputPhoto.click();
  }

  private compressBlob(blob: Blob): void {
    const blobUrl: string = URL.createObjectURL(blob);
    const img: HTMLImageElement = new Image();
    img.src = blobUrl;
    img.onerror = function () {
      URL.revokeObjectURL(this.src);
      // Handle the failure properly
      console.log("Cannot load image");
    };
    img.onload = () => {
      const finalHeight: number = 180;
      const finalWidth: number = 180;
      let [newWidth, newHeight] = this.calculateSize(img);
      const canvas: HTMLCanvasElement = document.createElement('canvas');
      canvas.width = finalWidth;
      canvas.height = finalHeight;
      let xBegin: number = 0;
      let yBegin: number = 0;
      if (newWidth > finalWidth) {
        xBegin = Math.round((newWidth - finalWidth) / 2);
      } else {
        newWidth = finalWidth;
      }
      if (newHeight > finalHeight) {
        yBegin = Math.round((newHeight - finalHeight) / 2);
      } else {
        newHeight = finalHeight;
      }

      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, -xBegin, -yBegin, newWidth, newHeight);
      canvas.toBlob((b: Blob) => {
        if(this.editPhotoImgElement){
          this.editPhotoImgElement.src = URL.createObjectURL(b);
        } else {
          this.editPhotoImgElement = this.photoDiv.querySelector('img');
          this.editPhotoImgElement.style.display = 'block';
          this.editPhotoImgElement.src = URL.createObjectURL(b);
        }
        this.addFile(new File([b], 'i.png'));
      });
    }
  }

  private addFile(file: File): void {
    this.newImageFile = file;
    this.isLoadingImport = false;
    this.formGp.updateValueAndValidity()
  }

  private calculateSize(img: HTMLImageElement): [number, number] {

    let width: number = img.width;
    let height: number = img.height;
    const maxHeight: number = 360;
    const maxWidth: number = 360;


    if (width > height) {
      if (width > maxWidth) {
        height = Math.round((height * maxWidth) / width);
        width = maxWidth;
      }
    } else {
      if (height > maxHeight) {
        width = Math.round((width * maxHeight) / height);
        height = maxHeight;
      }
    }
    return [width, height];
  }

}
