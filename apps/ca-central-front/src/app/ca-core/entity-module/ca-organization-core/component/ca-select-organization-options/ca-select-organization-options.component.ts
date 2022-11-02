import {AfterViewInit, Component, Host, OnDestroy, OnInit} from '@angular/core';
import {FlDatasourcePaginated, FlEmbeddedOptionsAbstractDirective} from '@monorepo/front-core-lib';
import {CaOrganization} from '../../../../model/entities/ca-organization.class';
import {CaOrganizationService} from '../../../../service-api/ca-organization.service';
import {MatSelect} from '@angular/material/select';

/**
 * Component to be placed in a mat-select to add option of all organization
 */
@Component({
  selector: 'ca-select-organization-options',
  templateUrl: './ca-select-organization-options.component.html',
  styleUrls: ['./ca-select-organization-options.component.scss']
})
export class CaSelectOrganizationOptionsComponent extends FlEmbeddedOptionsAbstractDirective
  implements OnInit, AfterViewInit, OnDestroy {

  constructor(private organizationService: CaOrganizationService,
              @Host() private select: MatSelect) {
    super(select);
  }

  datasource: FlDatasourcePaginated<CaOrganization>;

  ngOnInit(): void {
    this.overrideCompareWithOnIds(this.select);
    this.datasource = this.organizationService.getAllDatasource();
  }

  ngAfterViewInit(): void {
    this.initOptions();
  }

  ngOnDestroy(): void {
    this.datasource?.disconnect();
  }
}
