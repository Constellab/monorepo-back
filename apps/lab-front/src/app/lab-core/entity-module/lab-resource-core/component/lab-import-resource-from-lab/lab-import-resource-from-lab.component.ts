import {Component, OnInit} from '@angular/core';
import {FormControl, Validators} from '@angular/forms';
import {FlSnackBarService} from '@monorepo/front-core-lib';
import {MatDialogRef} from '@angular/material/dialog';
import {LabResource} from '../../../../model/entities/resource/lab-resource.entity';
import {LabShareService} from '../../../../entity-service/lab-share.service';

/**
 * Import a resource from another lab with the share link
 */
@Component({
  selector: 'lab-import-resource-from-lab',
  templateUrl: './lab-import-resource-from-lab.component.html',
  styleUrls: ['./lab-import-resource-from-lab.component.scss']
})
export class LabImportResourceFromLabComponent implements OnInit {

  formCtrl: FormControl;

  isLoading: boolean;

  constructor(private dialogRef: MatDialogRef<LabImportResourceFromLabComponent>,
              private shareService: LabShareService,
              private snackBarService: FlSnackBarService) {
  }

  ngOnInit(): void {
    this.formCtrl = new FormControl(null, [Validators.required]);
  }

  submit(): void {
    if (!this.isLoading && this.formCtrl.valid) {
      this.importResource(this.formCtrl.value);
    }
  }

  private importResource(url: string): void {
    this.isLoading = true;
    this.shareService.importResourceFromLab(url).subscribe({
      next: resource => this.importResourceSuccess(resource),
      error: () => this.isLoading = false
    });
  }

  private importResourceSuccess(resource: LabResource): void {
    this.snackBarService.openSuccessMessage({text: 'biox.resource_imported', translateText: true});
    this.dialogRef.close(resource);
    this.isLoading = false;
  }
}
