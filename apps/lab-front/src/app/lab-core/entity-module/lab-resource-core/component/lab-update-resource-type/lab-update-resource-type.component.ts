import {Component, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {LabResource} from '../../../../model/entities/resource/lab-resource.entity';
import {LabFileResourceService} from '../../../../entity-service/lab-file-resource.service';
import {FormControl, Validators} from '@angular/forms';
import {LabFileType} from '../../../../model/entities/resource/lab-file-type';
import {FlSnackBarService} from '@monorepo/front-core-lib';
import {Observable} from 'rxjs';

/**
 * Dialog to update the type of a file
 */
@Component({
  selector: 'lab-update-resource-type',
  templateUrl: './lab-update-resource-type.component.html',
  styleUrls: ['./lab-update-resource-type.component.scss']
})
export class LabUpdateResourceTypeComponent implements OnInit {

  formControl: FormControl;

  fileTypes$: Observable<LabFileType[]>;

  isLoading: boolean = false;

  constructor(@Inject(MAT_DIALOG_DATA) private resource: LabResource,
              private dialogRef: MatDialogRef<LabUpdateResourceTypeComponent>,
              private labFileService: LabFileResourceService,
              private snackBarService: FlSnackBarService) {
  }

  ngOnInit(): void {
    this.formControl = new FormControl(this.resource.resourceTypingName, [Validators.required]);
    this.fileTypes$ = this.labFileService.getFileTypes();
  }


  submit(): void {
    if (this.formControl.valid && !this.isLoading) {
      this.updateType(this.formControl.value);
    }
  }

  private updateType(type: string): void {
    this.isLoading = true;
    this.labFileService.updateFileType(this.resource.id, type).subscribe(
      resource => this.updateTypeSuccess(resource),
      () => this.isLoading = false
    );
  }

  private updateTypeSuccess(resource: LabResource): void {
    this.snackBarService.openSuccessMessage('biox.resource_type_updated', true);
    this.dialogRef.close(resource);
    this.isLoading = false;
  }
}
