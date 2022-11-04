import {Component, OnInit} from '@angular/core';
import {CaOrganization, CaOrganizationDatasource} from '../../../ca-core/model/entities/ca-organization.class';
import {CaOrganizationService} from '../../../ca-core/service-api/ca-organization.service';
import {FlDialogService, FlFormDialogInput, FlTableColumn} from '@monorepo/front-core-lib';
import {
  CaOrganizationFormDialogComponent
} from '../../../ca-core/entity-module/ca-organization-core/component/ca-organization-form-dialog/ca-organization-form-dialog.component';

@Component({
  selector: 'ca-admin-organizations-list',
  templateUrl: './ca-admin-organizations-list.component.html',
  styleUrls: ['./ca-admin-organizations-list.component.scss']
})
export class CaAdminOrganizationsListComponent implements OnInit {

  organizations: CaOrganizationDatasource;

  columns: FlTableColumn<CaOrganization>[] = ['label', 'created', 'lastModified', 'detail'];

  constructor(private organizationService: CaOrganizationService,
              private dialogService: FlDialogService) {
  }

  ngOnInit(): void {
    this.organizations = this.organizationService.getAllDatasource();
  }

  createOrganization(): void {
    const input: FlFormDialogInput = {
      mode: 'create'
    };

    this.dialogService.openSmallDialog(CaOrganizationFormDialogComponent, {data: input}).afterClosed().subscribe(
      version => this.onCreateClosed(version)
    );
  }

  private onCreateClosed(orga?: CaOrganization): void {
    if (orga) {
      this.organizations.addItem(orga, () => true);
    }
  }

  loadMoreResults(): void {
    this.organizations.getNextPage();
  }

}
