import {Component, OnInit} from '@angular/core';
import {CaOrganization, CaSaveOrganizationDTO} from '../../../../ca-core/model/entities/ca-organization.class';
import {
  FlConfirmDialogInput,
  FlConfirmDialogResult,
  FlDialogService,
  FlFormDialogInput
} from '@monorepo/front-core-lib';
import {
  CaOrganizationFormDialogComponent
} from '../../../../ca-core/entity-module/ca-organization-core/component/ca-organization-form-dialog/ca-organization-form-dialog.component';
import {CaOrganizationService} from '../../../../ca-core/service-api/ca-organization.service';
import {CaRouterService} from '../../../../ca-core/service/ca-router.service';
import {
  CaOrganizationUploadPhotoDialogComponent,
  CaOrganizationUploadPhotoDialogInput
} from '../ca-organization-upload-photo-dialog/ca-organization-upload-photo-dialog.component';
import {CaCurrentOrganizationService} from '../../../../ca-core/service-api/ca-current-organization.service';
import {Observable} from 'rxjs';
import {CaRequestNewLicensesComponent} from '../ca-request-new-licenses/ca-request-new-licenses.component';

/**
 * Show all the information about an organization
 */
@Component({
  selector: 'ca-current-organization-detail',
  templateUrl: './ca-current-organization-detail.component.html',
  styleUrls: ['./ca-current-organization-detail.component.scss']
})
export class CaCurrentOrganizationDetailComponent implements OnInit {

  organization$: Observable<CaOrganization>;

  constructor(private dialogService: FlDialogService,
              private organizationService: CaOrganizationService,
              private currentOrganizationService: CaCurrentOrganizationService,
              private routerService: CaRouterService) {
  }

  ngOnInit(): void {
    this.organization$ = this.currentOrganizationService.getCurrentOrganization$();
  }

  openUploadPhotoDialog(organization: CaOrganization): void {
    const data: CaOrganizationUploadPhotoDialogInput = {
      organizationId: organization.id
    };

    this.dialogService.openSmallDialog(CaOrganizationUploadPhotoDialogComponent,
      {data: data}).afterClosed().subscribe(
      (result: CaOrganization) => this.onUploadPhotoClosed(result));
  }

  private onUploadPhotoClosed(organization?: CaOrganization): void {
    if (organization) {
      this.currentOrganizationService.setCurrentOrganization(organization);
    }
  }

  openUpdateDialog(organization: CaOrganization): void {
    const data: FlFormDialogInput<CaSaveOrganizationDTO> = {
      mode: 'update',
      object: {
        id: organization.id,
        label: organization.label,
        domain: organization.domain,
        nbLicenses: organization.nbLicenses
      }
    };

    this.dialogService.openSmallDialog(CaOrganizationFormDialogComponent, {data: data}).afterClosed().subscribe(
      organization => this.onUpdateClosed(organization)
    );
  }

  private onUpdateClosed(organization?: CaOrganization): void {
    if (organization) {
      this.currentOrganizationService.setCurrentOrganization(organization);
    }
  }

  openDeleteOrganization(organization: CaOrganization): void {
    const data: FlConfirmDialogInput = {
      title: 'delete_organization',
      content: 'delete_organization_confirmation',
      translateTitleAndContent: true,
      observable: this.organizationService.deleteById(organization.id),
      successMessage: 'organization_deleted',
      translateMessage: true
    };

    this.dialogService.openConfirmDialog(data).afterClosed().subscribe(
      result => this.onDeleteClosed(result)
    );
  }

  private onDeleteClosed(result: FlConfirmDialogResult): void {
    if (result.choice) {
      this.routerService.navigateToAdmin();
    }
  }

  openRequestNewLicense(organization: CaOrganization): void {
    this.dialogService.openMediumDialog(CaRequestNewLicensesComponent, {data: organization.id});
  }

}
