import {Component, OnInit} from '@angular/core';
import {FormBuilder, FormGroup} from '@ngneat/reactive-forms';
import {CaSmartDbService} from '../../../service/ca-smart-db.service';
import {FlSnackBarService} from '@monorepo/front-core-lib';
import {MatDialogRef} from '@angular/material/dialog';
import {Validators} from '@angular/forms';

interface Form {
  file: File;
  resetData: boolean;
}

@Component({
  selector: 'ca-smart-db-import-dialog',
  templateUrl: './ca-smart-db-import-dialog.component.html',
  styleUrls: ['./ca-smart-db-import-dialog.component.scss']
})
export class CaSmartDbImportDialogComponent implements OnInit {

  formGp: FormGroup<Form>;

  isLoading: boolean = false;

  constructor(private smartDbService: CaSmartDbService,
              private snackBarService: FlSnackBarService,
              private dialogRef: MatDialogRef<CaSmartDbImportDialogComponent>) {
  }

  ngOnInit(): void {
    this.formGp = new FormBuilder().group({
      file: [null, Validators.required],
      resetData: [null]
    });
  }

  submit(): void {
    if (!this.isLoading && this.formGp.valid) {
      const form: Form = this.formGp.getRawValue();

      this.isLoading = true;
      if (form.resetData) {
        this.initData(form.file);
      } else {
        this.uploadData(form.file);
      }
    }
  }

  private uploadData(file: File): void {
    this.smartDbService.uploadData(file).subscribe(
      () => this.uploadSuccess(),
      () => this.isLoading = false
    );
  }

  private initData(file: File): void {
    this.smartDbService.init(file).subscribe(
      () => this.uploadSuccess(),
      () => this.isLoading = false
    );
  }

  private uploadSuccess(): void {
    this.snackBarService.openSuccessMessage({text: 'smart_db.upload_data_success', translateText: true});
    this.dialogRef.close();
  }

}
