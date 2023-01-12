import {Component, Inject, OnInit} from '@angular/core';
import {FlFormDialogAbstractDirective, FlFormDialogInput, FlSnackBarService} from '@monorepo/front-core-lib';
import {HaBrickService} from '../../../../ha-core/ha-service/ha-brick.service';
import {
  MAT_LEGACY_DIALOG_DATA as MAT_DIALOG_DATA,
  MatLegacyDialogRef as MatDialogRef
} from '@angular/material/legacy-dialog';
import {
  HaAddVersionInput,
  HaNewVersionDTO,
  HaNewVersionFile,
} from '../../../../ha-core/ha-model/ha-entities/ha-version.class';
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
  inputFile: HaAddVersionInput;
  errorFile: boolean;
  errorFileText: string;
  isLoadingImport: boolean = false;

  constructor(
    @Inject(MAT_DIALOG_DATA)
    protected dialogInput: FlFormDialogInput<HaNewVersionDTO>,
    private brickService: HaBrickService,
    snackBarService: FlSnackBarService,
    dialogRef: MatDialogRef<HaPublicAddVersionDialogComponent>
  ) {
    super(dialogInput, snackBarService, dialogRef);
  }

  ngOnInit(): void {
    this.isUpdate = this.dialogInput.mode == 'update';
    this.init();
    this.brickId = this.dialogInput.object.brickId;
    this.errorFile = false;
  }

  buildForm(): FormGroup<Partial<HaNewVersionDTO>> {
    return new FormBuilder().group({
      version: [null, [Validators.pattern(new RegExp('^(\\d+\\.)(\\d+\\.)(\\*|\\d+)$'))]],
      repoType: [null],
      isBeta: [false],
      subPatch: [null]
    });
  }

  create(formValue: Partial<HaNewVersionDTO>): Observable<Partial<HaNewVersionDTO>> {
    formValue.brickId = this.brickId;
    formValue.isBeta = this.inputFile.version.includes('-beta.');
    if (formValue.isBeta) {
      formValue.subPatch = +this.inputFile.version.split('-beta.')[1];
    }
    formValue.version = this.inputFile.version;
    return this.brickService.createNewVersion(formValue, this.inputFile.technicalInfo, this.inputFile.brickVersionReferences);
  }

  update(formValue: Partial<HaNewVersionDTO>): Observable<Partial<HaNewVersionDTO>> {
    return undefined;
  }

  getCreateSuccessMessage(): string {
    return 'new_version_added';
  }

  getUpdateSuccessMessage(): string {
    return '';
  }

  onFileSelected($event: File): void {
    this.isLoadingImport = true;
    if ($event == null) {
      return;
    }
    this.errorFile = false;
    if (!$event.name.endsWith('.json')) {
      this.errorFile = true;
      this.errorFileText = 'file_wrong_type';
    }
    if (typeof (FileReader) !== 'undefined' && !this.errorFile) {
      const reader = new FileReader();

      reader.onload = (e: any) => {
        const srcResult = JSON.parse(e.target.result);
        if (srcResult as HaNewVersionFile && this.isSettingJson(srcResult)) {
          this.brickService.isActualBrickAndNewVersion(this.brickId, srcResult.name, srcResult.version)
            .subscribe(([res, res2]) => {
              if (res) {
                this.inputFile =
                  new HaAddVersionInput(res, srcResult.name, srcResult.version, srcResult.environment, srcResult.technical_info);
                this.isUpdate = res2;
              } else {
                this.errorFile = true;
                this.errorFileText = 'file_wrong_brick_or_major';
              }
              this.isLoadingImport = false;
            });
        } else {
          this.isLoadingImport = false;
          this.errorFile = true;
          this.errorFileText = 'file_wrong_type';
        }
      };

      reader.readAsText($event);
    }
  }

  private isSettingJson(file: HaNewVersionFile): boolean {
    return file.name != null && file.version != null && file.environment != null;
  }


}
