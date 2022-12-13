import {Component, Inject, OnInit} from '@angular/core';
import {CaLabInstanceForm, CaLabInstanceWithSpace} from '../../../../model/entities/ca-lab-instance.class';
import {FormBuilder, FormGroup} from '@ngneat/reactive-forms';
import {Observable} from 'rxjs';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {CaLabInstanceService} from '../../../../service-api/ca-lab-instance.service';
import {Validators} from '@angular/forms';
import {FlFormDialogAbstractDirective, FlFormDialogInput, FlSnackBarService} from '@monorepo/front-core-lib';
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
              private countryService: CaCountryService) {
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
  }

  buildForm(): FormGroup<CaLabInstanceForm> {
    return new FormBuilder().group({
      id: [null],
      name: [null, [Validators.required]],
      virtualHost: [null, [Validators.required]],
      serverInfo: [null, [Validators.required]],
      owner: [null, this.isCreateMode() ? Validators.required : null],
      glabApiKey: [null],
      labManagerApiKey: [null],
      codelabToken: [null],
      city: [null, Validators.required],
      space: [{value: null, disabled: this.isUpdateMode()}, Validators.required],
    });
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
