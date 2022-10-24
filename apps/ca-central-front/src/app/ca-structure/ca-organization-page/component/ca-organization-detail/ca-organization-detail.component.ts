import {Component, Input, OnInit} from '@angular/core';
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

/**
 * Show all the information about an organization
 */
@Component({
  selector: 'ca-organization-detail',
  templateUrl: './ca-organization-detail.component.html',
  styleUrls: ['./ca-organization-detail.component.scss']
})
export class CaOrganizationDetailComponent implements OnInit {

  @Input() organization: CaOrganization;

  constructor(private dialogService: FlDialogService,
              private organizationService: CaOrganizationService,
              private routerService: CaRouterService) {
  }

  ngOnInit(): void {
  }

  openUpdateDialog(): void {
    const data: FlFormDialogInput<CaSaveOrganizationDTO> = {
      mode: 'update',
      object: {
        id: this.organization.id,
        label: this.organization.label,
        domain: this.organization.domain,
        nbLicenses: this.organization.nbLicenses
      }
    };

    this.dialogService.openSmallDialog(CaOrganizationFormDialogComponent, {data: data}).afterClosed().subscribe(
      organization => this.onUpdateClosed(organization)
    );
  }

  private onUpdateClosed(organization?: CaOrganization): void {
    if (organization) {
      this.organization.label = organization.label;
      this.organization.domain = organization.domain;
      this.organization.nbLicenses = organization.nbLicenses;
    }
  }

  openDeleteOrganization(): void {
    const data: FlConfirmDialogInput = {
      title: 'delete_organization',
      content: 'delete_organization_confirmation',
      translateTitleAndContent: true,
      observable: this.organizationService.deleteById(this.organization.id),
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

}
