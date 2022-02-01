import {Component, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {LabResource} from '../../../../model/entities/resource/lab-resource.entity';
import {LabResourceService} from '../../../../entity-service/lab-resource.service';
import {FlSnackBarService} from '@monorepo/front-core-lib';
import {FormControl} from '@ngneat/reactive-forms';
import {Validators} from '@angular/forms';

@Component({
  selector: 'lab-lab-update-resource-name-dialog',
  templateUrl: './lab-update-resource-name-dialog.component.html',
  styleUrls: ['./lab-update-resource-name-dialog.component.scss']
})
export class LabUpdateResourceNameDialogComponent implements OnInit {

  formCtrl: FormControl<string>;

  isLoading: boolean = false;

  constructor(@Inject(MAT_DIALOG_DATA) private resource: LabResource,
              private dialogRef: MatDialogRef<LabUpdateResourceNameDialogComponent>,
              private resourceService: LabResourceService,
              private snackBarService: FlSnackBarService) {
  }

  ngOnInit(): void {
    this.formCtrl = new FormControl<string>(this.resource.name, [Validators.required]);
  }

  submit(): void {
    if (!this.isLoading && this.formCtrl.valid) {
      this.updateName(this.formCtrl.value);
    }
  }

  private updateName(name: string): void {
    this.isLoading = true;
    this.resourceService.updateName(this.resource.id, name).subscribe(
      resource => this.updateNameSuccess(resource),
      () => this.isLoading = false
    );
  }

  private updateNameSuccess(resource: LabResource): void {
    this.snackBarService.openSuccessMessage('biox.resource_name_updated', true);
    this.dialogRef.close(resource);
    this.isLoading = false;
  }


}
