import {Component, Inject, OnInit} from '@angular/core';
import {
  CaLabInstance,
  CaLabInstanceType,
  CaLabInstanceWithSpace,
  CaLabOnPromisePlatform
} from '../../../../model/entities/lab/ca-lab-instance.class';
import {
  FlFormDialogAbstractDirective,
  FlFormDialogInput,
  FlPlatformService,
  FlSnackBarService
} from '@monorepo/front-core-lib';
import {CaLabInstanceService} from '../../../../service-api/ca-lab-instance.service';
import {FormBuilder, FormGroup} from '@ngneat/reactive-forms';
import {Validators} from '@angular/forms';
import {Observable} from 'rxjs';
import {
  CaLabInstanceAdminFormDialogInput
} from '../ca-lab-instance-admin-form-dialog/ca-lab-instance-admin-form-dialog.component';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';

export type CaLabInstanceFormDialogInput = FlFormDialogInput<CaLabInstanceForm>;

interface CaLabInstanceForm {
  id: string;
  name: string;
  type: CaLabInstanceType;
  onPremisePlatform?: CaLabOnPromisePlatform;

  cloudProvider?: string;
  cpuCount?: string;
  storageSize?: string;
  labNeed?: string;
  additionalInfo?: string;
}

/**
 * Form to create or update a lab instance accessible by user
 */
@Component({
  selector: 'ca-lab-instance-form-dialog',
  templateUrl: './ca-lab-instance-form-dialog.component.html',
  styleUrls: ['./ca-lab-instance-form-dialog.component.scss']
})
export class CaLabInstanceFormDialogComponent extends FlFormDialogAbstractDirective<CaLabInstanceForm, any>
  implements OnInit {

  maxNameLength = CaLabInstance.MAX_NAME_LENGTH;

  constructor(snackBarService: FlSnackBarService,
              dialogRef: MatDialogRef<CaLabInstanceFormDialogComponent>,
              @Inject(MAT_DIALOG_DATA) dialogInput: CaLabInstanceAdminFormDialogInput,
              private labInstanceService: CaLabInstanceService,
              private platformService: FlPlatformService) {
    super(dialogInput, snackBarService, dialogRef);
  }

  get title(): string {
    return this.isCreateMode() ? 'create_lab_instance' : 'update_lab_instance';
  }

  ngOnInit(): void {
    this.init();

    this.onTypeChange(this.formGp.value.type);
  }

  buildForm(): FormGroup<CaLabInstanceForm> {
    return new FormBuilder().group({
      id: [null],
      name: [null, [Validators.required]],
      type: [{value: 'CLOUD', disabled: this.isUpdateMode()}, [Validators.required]],
      cloudProvider: [null],
      cpuCount: [null],
      storageSize: [null],
      labNeed: [null],
      additionalInfo: [null],
      onPremisePlatform: [this.platformService.isSafari() ? 'MAC' : 'WINDOWS', [Validators.required]],
    });
  }

  onTypeChange(type: CaLabInstanceType): void {
    if (type === 'CLOUD') {
      this.formGp.get('name').disable();
      this.formGp.get('onPremisePlatform').disable();
    } else {
      this.formGp.get('name').enable();
      this.formGp.get('onPremisePlatform').enable();
    }
    this.formGp.updateValueAndValidity();
  }

  isCloud(): boolean {
    return this.formGp.value.type === 'CLOUD';
  }

  create(formValue: CaLabInstanceForm): Observable<any> {
    if (formValue.type === 'ON_PREMISE') {
      return this.createOnPremiseLab(formValue);
    } else {
      return this.requestCloudLab(formValue);
    }
  }

  private createOnPremiseLab(formValue: CaLabInstanceForm): Observable<CaLabInstance> {
    return this.labInstanceService.createOnPremiseLab({
      id: formValue.id,
      name: formValue.name,
      onPremisePlatform: formValue.onPremisePlatform,
    });
  }

  private requestCloudLab(formValue: CaLabInstanceForm): Observable<CaLabInstance> {
    return this.labInstanceService.requestNewLabInstance({
      cloudProvider: formValue.cloudProvider,
      cpuCount: formValue.cpuCount,
      storageSize: formValue.storageSize,
      labNeed: formValue.labNeed,
      additionalInfo: formValue.additionalInfo,
    });
  }

  update(formValue: CaLabInstanceForm): Observable<CaLabInstanceWithSpace> {
    return this.labInstanceService.updateAdmin(formValue);
  }

  getCreateSuccessMessage(): string {
    return this.formGp.value.type === 'CLOUD' ? 'lab_instance_request_sent' : 'lab_instance_created';
  }

  getUpdateSuccessMessage(): string {
    return 'lab_instance_updated';
  }


}
