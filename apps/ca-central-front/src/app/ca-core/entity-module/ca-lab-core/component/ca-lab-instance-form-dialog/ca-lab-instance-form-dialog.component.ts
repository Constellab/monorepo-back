import {Component, Inject, OnInit} from '@angular/core';
import {
  CaLabInstanceForm,
  CaLabInstanceType,
  CaLabInstanceWithSpace
} from '../../../../model/entities/lab/ca-lab-instance.class';
import {FormBuilder, FormGroup} from '@ngneat/reactive-forms';
import {Observable} from 'rxjs';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {CaLabInstanceService} from '../../../../service-api/ca-lab-instance.service';
import {Validators} from '@angular/forms';
import {
  FlFormDialogAbstractDirective,
  FlFormDialogInput,
  FlGlobalValidators,
  FlPlatformService,
  FlSnackBarService
} from '@monorepo/front-core-lib';
import {CaCountryService} from '../../../../service-api/ca-country.service';
import {CaCountry} from '../../../../model/entities/ca-country.entity';

export type CaLabInstanceFormDialogInput = FlFormDialogInput<CaLabInstanceForm>;

@Component({
  selector: 'ca-lab-instance-form-dialog',
  templateUrl: './ca-lab-instance-form-dialog.component.html',
  styleUrls: ['./ca-lab-instance-form-dialog.component.scss']
})
export class CaLabInstanceFormDialogComponent extends FlFormDialogAbstractDirective<CaLabInstanceForm, CaLabInstanceWithSpace>
  implements OnInit {

  countries: CaCountry[];

  constructor(snackBarService: FlSnackBarService,
              dialogRef: MatDialogRef<CaLabInstanceFormDialogComponent>,
              @Inject(MAT_DIALOG_DATA) dialogInput: CaLabInstanceFormDialogInput,
              private labInstanceService: CaLabInstanceService,
              private countryService: CaCountryService,
              private platformService: FlPlatformService) {
    super(dialogInput, snackBarService, dialogRef);
  }

  get title(): string {
    return this.isCreateMode() ? 'create_lab_instance' : 'update_lab_instance';
  }

  ngOnInit(): void {

    this.countryService.get().subscribe(cities => {
      this.countries = cities;
    });
    this.init();

    this.onTypeChange(this.formGp.value.type);
  }

  buildForm(): FormGroup<CaLabInstanceForm> {
    return new FormBuilder().group({
      id: [null],
      name: [null, [Validators.required]],
      type: [{value: 'CLOUD', disabled: this.isUpdateMode()}, [Validators.required]],
      virtualHost: [null, [Validators.required]],
      serverInfo: [null, [Validators.required]],
      billingMode: ['MONTHLY', [Validators.required]],
      volumeSize: [null, [Validators.required, FlGlobalValidators.isInteger, Validators.min(50)]],
      volumeType: ['HIGH_SPEED', [Validators.required]],
      glabApiKey: [null],
      labManagerApiKey: [null],
      codelabToken: [null],
      serverInstanceId: [null],
      serverVolumeId: [null],
      gwsCoreProdDbPassword: [null],
      gwsCoreDevDbPassword: [null],
      region: [null, Validators.required],
      space: [{value: null, disabled: this.isUpdateMode()}, Validators.required],
      onPremisePlatform: [this.platformService.isSafari() ? 'MAC' : 'WINDOWS', [Validators.required]]
    });
  }

  onTypeChange(type: CaLabInstanceType): void {
    if (type === 'CLOUD') {
      this.formGp.get('virtualHost').enable();
      this.formGp.get('serverInfo').enable();
      this.formGp.get('billingMode').enable();
      this.formGp.get('volumeSize').enable();
      this.formGp.get('volumeType').enable();
      this.formGp.get('labManagerApiKey').enable();
      this.formGp.get('codelabToken').enable();
      this.formGp.get('serverInstanceId').enable();
      this.formGp.get('serverVolumeId').enable();
      this.formGp.get('region').enable();

      this.formGp.get('onPremisePlatform').disable();

    } else {
      this.formGp.get('virtualHost').disable();
      this.formGp.get('serverInfo').disable();
      this.formGp.get('billingMode').disable();
      this.formGp.get('volumeSize').disable();
      this.formGp.get('volumeType').disable();
      this.formGp.get('labManagerApiKey').disable();
      this.formGp.get('codelabToken').disable();
      this.formGp.get('serverInstanceId').disable();
      this.formGp.get('serverVolumeId').disable();
      this.formGp.get('region').disable();

      this.formGp.get('onPremisePlatform').enable();
    }
    this.formGp.updateValueAndValidity();
  }

  isCloud(): boolean {
    return this.formGp.value.type === 'CLOUD';
  }

  create(formValue: CaLabInstanceForm): Observable<CaLabInstanceWithSpace> {
    return this.labInstanceService.create(formValue);
  }

  update(formValue: CaLabInstanceForm): Observable<CaLabInstanceWithSpace> {
    return this.labInstanceService.update(formValue);
  }

  getCreateSuccessMessage(): string {
    return 'lab_instance_created';
  }

  getUpdateSuccessMessage(): string {
    return 'lab_instance_updated';
  }

}
