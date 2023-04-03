import {Component, Inject, OnInit} from '@angular/core';
import {
  CaLabInstanceAdminForm,
  CaLabInstanceType,
  CaLabInstanceWithSpace,
  CaLabSupportedDomains
} from '../../../../model/entities/lab/ca-lab-instance.class';
import {FormBuilder, FormGroup} from '@ngneat/reactive-forms';
import {Observable} from 'rxjs';
import {CaLabInstanceService} from '../../../../service-api/ca-lab-instance.service';
import {AbstractControl, ValidationErrors, ValidatorFn, Validators} from '@angular/forms';
import {
  FlFormDialogAbstractDirective,
  FlFormDialogInput,
  FlGlobalValidators,
  FlPlatformService,
  FlSnackBarService
} from '@monorepo/front-core-lib';
import {CaCountryService} from '../../../../service-api/ca-country.service';
import {CaCountry} from '../../../../model/entities/ca-country.entity';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';

export type CaLabInstanceAdminFormDialogInput = FlFormDialogInput<CaLabInstanceAdminForm>;

/**
 * Form to create or update a lab instance (only accessible by admin)
 */
@Component({
  selector: 'ca-lab-instance-admin-form-dialog',
  templateUrl: './ca-lab-instance-admin-form-dialog.component.html',
  styleUrls: ['./ca-lab-instance-admin-form-dialog.component.scss']
})
export class CaLabInstanceAdminFormDialogComponent extends FlFormDialogAbstractDirective<CaLabInstanceAdminForm, CaLabInstanceWithSpace>
  implements OnInit {

  countries: CaCountry[];

  maxNameLength = CaLabInstanceWithSpace.MAX_NAME_LENGTH;

  supportedDomains = CaLabSupportedDomains;
  supportedDomainsText = CaLabSupportedDomains.join(', ');

  constructor(snackBarService: FlSnackBarService,
              dialogRef: MatDialogRef<CaLabInstanceAdminFormDialogComponent>,
              @Inject(MAT_DIALOG_DATA) dialogInput: CaLabInstanceAdminFormDialogInput,
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

    this.onTypeChange(this.formGp.getRawValue().type);
  }

  buildForm(): FormGroup<CaLabInstanceAdminForm> {
    return new FormBuilder().group({
      id: [null],
      name: [null, [Validators.required]],
      type: [{value: 'CLOUD', disabled: this.isUpdateMode()}, [Validators.required]],
      virtualHost: [null, [Validators.required, this.virtualHostValidator()]],
      serverInfo: [null, [Validators.required]],
      billingMode: [null, [Validators.required]],
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
      space: [null, Validators.required],
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
    return this.formGp.getRawValue().type === 'CLOUD';
  }

  create(formValue: CaLabInstanceAdminForm): Observable<CaLabInstanceWithSpace> {
    return this.labInstanceService.createAdmin(formValue);
  }

  update(formValue: CaLabInstanceAdminForm): Observable<CaLabInstanceWithSpace> {
    return this.labInstanceService.updateAdmin(formValue);
  }

  getCreateSuccessMessage(): string {
    return 'lab_instance_created';
  }

  getUpdateSuccessMessage(): string {
    return 'lab_instance_updated';
  }

  public virtualHostValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const value: any = control.value;
      if (value == null || value.length === 0) {
        return null;  // don't validate empty values to allow optional controls
      }

      // check that the value is a subdomain of one of supportedDomains
      const subDomain = value.split('.')[0];
      if (subDomain.length === 0) {
        return {invalid: true};
      }

      const mainDomain = value.substring(subDomain.length + 1);
      if (this.supportedDomains.indexOf(mainDomain) === -1) {
        return {invalid: true};
      }

      return null;

    };
  }

}
