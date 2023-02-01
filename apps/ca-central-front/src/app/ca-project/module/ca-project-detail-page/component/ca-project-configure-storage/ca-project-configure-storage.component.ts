import {Component, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {FlFormDialogAbstractDirective, FlFormDialogInput, FlSnackBarService} from '@monorepo/front-core-lib';
import {CaProjectService} from '../../../../../ca-core/service-api/ca-project.service';
import {CaCloudProviderRegion} from '../../../../../ca-core/model/entities/ca-cloud-provider.class';
import {CaBucket} from '../../../../../ca-core/model/entities/ca-object-storage.class';
import {Observable} from 'rxjs';
import {FormBuilder, FormGroup} from '@ngneat/reactive-forms';
import {Validators} from '@angular/forms';

interface CaProjectConfigureForm {
  region: CaCloudProviderRegion;
}

export interface CaProjectConfigureStorageInput extends FlFormDialogInput<CaProjectConfigureForm> {
  projectId: string;
}

/**
 * Dialog to configure the storage for a project
 */
@Component({
  selector: 'ca-project-configure-storage',
  templateUrl: './ca-project-configure-storage.component.html',
  styleUrls: ['./ca-project-configure-storage.component.scss']
})
export class CaProjectConfigureStorageComponent
  extends FlFormDialogAbstractDirective<CaProjectConfigureForm, CaBucket>
  implements OnInit {

  constructor(@Inject(MAT_DIALOG_DATA) private input: CaProjectConfigureStorageInput,
              dialogRef: MatDialogRef<CaProjectConfigureStorageComponent>,
              snackBarService: FlSnackBarService,
              private projectService: CaProjectService) {
    super(input, snackBarService, dialogRef);
  }

  ngOnInit(): void {
    this.init();
  }

  buildForm(): FormGroup<CaProjectConfigureForm> {
    return new FormBuilder().group({
      region: [null, Validators.required]
    });
  }

  create(formValue: CaProjectConfigureForm): Observable<CaBucket> {
    return this.projectService.createProjectBucket(this.input.projectId, formValue.region);
  }

  getCreateSuccessMessage(): string {
    return 'project_storage_configured';
  }

  // Update is not supported
  getUpdateSuccessMessage(): string {
    return '';
  }

  update(): Observable<CaBucket> {
    return undefined;
  }


}
