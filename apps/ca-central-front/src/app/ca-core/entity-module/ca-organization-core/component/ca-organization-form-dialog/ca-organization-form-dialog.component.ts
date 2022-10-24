import {Component, Inject, OnInit} from '@angular/core';
import {FlFormDialogAbstractDirective, FlFormDialogInput, FlSnackBarService} from '@monorepo/front-core-lib';
import {CaOrganization, CaSaveOrganizationDTO} from '../../../../model/entities/ca-organization.class';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {FormBuilder, FormGroup} from '@ngneat/reactive-forms';
import {Validators} from '@angular/forms';
import {Observable} from 'rxjs';
import {CaOrganizationService} from '../../../../service-api/ca-organization.service';

@Component({
  selector: 'ca-organization-form-dialog',
  templateUrl: './ca-organization-form-dialog.component.html',
  styleUrls: ['./ca-organization-form-dialog.component.scss']
})
export class CaOrganizationFormDialogComponent extends FlFormDialogAbstractDirective<CaSaveOrganizationDTO, CaOrganization>
  implements OnInit {

  constructor(snackBarService: FlSnackBarService,
              dialogRef: MatDialogRef<CaOrganizationFormDialogComponent>,
              @Inject(MAT_DIALOG_DATA) dialogInput: FlFormDialogInput<CaSaveOrganizationDTO>,
              private organizationService: CaOrganizationService) {
    super(dialogInput, snackBarService, dialogRef);
  }

  ngOnInit(): void {
    this.init();
  }

  get title(): string {
    return this.isCreateMode() ? 'create_organization' : 'update_organization';
  }


  buildForm(): FormGroup<CaSaveOrganizationDTO> {
    return new FormBuilder().group({
      id: [null],
      label: [null, [Validators.required]],
      domain: [null, [Validators.required, Validators.pattern('^[a-zA-Z0-9-]*')]],
      nbLicenses: [null, [Validators.required]]
    });
  }

  create(formValue: CaSaveOrganizationDTO): Observable<CaOrganization> {
    return this.organizationService.create(formValue);
  }

  update(formValue: CaSaveOrganizationDTO): Observable<CaOrganization> {
    return this.organizationService.update(formValue);
  }

  getCreateSuccessMessage(): string {
    return 'organization_created';
  }

  getUpdateSuccessMessage(): string {
    return 'organization_updated';
  }


}
