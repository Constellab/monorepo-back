import {Component, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {LabResource} from '../../../../model/entities/resource/lab-resource.entity';
import {LabFileResourceService} from '../../../../entity-service/lab-file-resource.service';
import {FormControl, Validators} from '@angular/forms';
import {FlSnackBarService} from '@monorepo/front-core-lib';
import {Observable} from 'rxjs';
import {LabTypeEntity} from '../../../../model/entities/lab-type/lab-type.entity';
import {LabResourceService} from '../../../../entity-service/lab-resource.service';

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

  fsNodeTypes: Observable<LabTypeEntity[]>;

  isLoading: boolean = false;

  constructor(@Inject(MAT_DIALOG_DATA) private resource: LabResource,
              private dialogRef: MatDialogRef<LabUpdateResourceTypeComponent>,
              private labFileService: LabFileResourceService,
              private resourceService: LabResourceService,
              private snackBarService: FlSnackBarService) {
  }

  ngOnInit(): void {
    this.formControl = new FormControl(this.resource.resourceTypingName, [Validators.required]);

    if (this.resource.isFile()) {
      this.fsNodeTypes = this.labFileService.getFileTypes();
    } else {
      this.fsNodeTypes = this.labFileService.getFolderTypes();
    }
  }


  submit(): void {
    if (this.formControl.valid && !this.isLoading) {
      this.updateType(this.formControl.value);
    }
  }

  private updateType(type: string): void {
    this.isLoading = true;
    this.resourceService.updateResourceType(this.resource.id, type).subscribe(
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
