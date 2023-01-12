import {Component, Inject, OnInit} from '@angular/core';
import {FormControl} from '@ngneat/reactive-forms';
import {
  MAT_LEGACY_DIALOG_DATA as MAT_DIALOG_DATA,
  MatLegacyDialogRef as MatDialogRef
} from '@angular/material/legacy-dialog';
import {FlSnackBarService} from '@monorepo/front-core-lib';
import {Validators} from '@angular/forms';
import {LabViewConfig} from '../../../../model/entities/resource/lab-view-config.entity';
import {LabViewConfigService} from '../../../../entity-service/lab-view-config.service';

/**
 * Dialog to update the config view (only title for now)
 */
@Component({
  selector: 'lab-update-view-config-dialog',
  templateUrl: './lab-update-view-config-dialog.component.html',
  styleUrls: ['./lab-update-view-config-dialog.component.scss']
})
export class LabUpdateViewConfigDialogComponent implements OnInit {

  formCtrl: FormControl<string>;

  isLoading: boolean = false;

  constructor(@Inject(MAT_DIALOG_DATA) private viewConfig: LabViewConfig,
              private dialogRef: MatDialogRef<LabUpdateViewConfigDialogComponent>,
              private viewConfigService: LabViewConfigService,
              private snackBarService: FlSnackBarService) {
  }

  ngOnInit(): void {
    this.formCtrl = new FormControl<string>(this.viewConfig.title, [Validators.required]);
  }

  submit(): void {
    if (!this.isLoading && this.formCtrl.valid) {
      this.updateTitle(this.formCtrl.value);
    }
  }

  private updateTitle(title: string): void {
    this.isLoading = true;
    this.viewConfigService.updateTitle(this.viewConfig.id, title).subscribe({
      next: resource => this.updateNameSuccess(resource),
      error: () => this.isLoading = false
    });
  }

  private updateNameSuccess(viewConfig: LabViewConfig): void {
    this.snackBarService.openSuccessMessage({
      text: 'biox.view_config_title_updated',
      translateText: true
    });
    this.dialogRef.close(viewConfig);
    this.isLoading = false;
  }

}
