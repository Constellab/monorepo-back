import {Component, Inject, OnInit} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {CaLabInstanceService} from '../../../ca-core/service-api/ca-lab-instance.service';
import {FlFileHelper} from '@monorepo/front-core-lib';

export interface CaLabOnPremiseDownloadConfigInput {
  labInstanceId: string;
}

@Component({
  selector: 'ca-lab-on-premise-download-config',
  templateUrl: './ca-lab-on-premise-download-config.component.html',
  styleUrls: ['./ca-lab-on-premise-download-config.component.scss']
})
export class CaLabOnPremiseDownloadConfigComponent implements OnInit {

  formGp: FormGroup;

  isLoading: boolean = false;

  constructor(@Inject(MAT_DIALOG_DATA) private data: CaLabOnPremiseDownloadConfigInput,
              private formBuilder: FormBuilder,
              private labInstanceService: CaLabInstanceService,
              private dialogRef: MatDialogRef<CaLabOnPremiseDownloadConfigComponent>) {
  }

  ngOnInit(): void {
    this.formGp = this.formBuilder.group({
      glabTag: ['beta', Validators.required]
    });
  }

  submit(): void {
    if (!this.isLoading && this.formGp.valid) {
      this.downloadConfig();
    }
  }

  private downloadConfig(): void {
    this.isLoading = true;
    this.labInstanceService.getOnPremiseConfigDownloadUrl(this.data.labInstanceId, this.formGp.getRawValue())
      .subscribe({
        next: (result) => this.downloadConfigSuccess(result),
        error: () => this.isLoading = false
      });
  }

  private downloadConfigSuccess(result: Blob): void {
    FlFileHelper.downloadBlob(result, 'constellab-on-premise.zip');
    this.dialogRef.close();
    this.isLoading = false;
  }


}
