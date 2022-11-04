import {Component, OnInit} from '@angular/core';
import {FlTableAbstractDirective} from '@monorepo/front-core-lib';
import {CaOrganization} from '../../../../model/entities/ca-organization.class';
import {CaRouterService} from '../../../../service/ca-router.service';

@Component({
  selector: 'ca-organization-table',
  templateUrl: './ca-organization-table.component.html',
  styleUrls: ['./ca-organization-table.component.scss']
})
export class CaOrganizationTableComponent extends FlTableAbstractDirective<CaOrganization>
  implements OnInit {

  currentOrganizationRoute = CaRouterService.getCurrentOrganizationRoute();

  constructor() {
    super(['created', 'lastModified', 'detail']);
  }

  ngOnInit(): void {
  }
}
