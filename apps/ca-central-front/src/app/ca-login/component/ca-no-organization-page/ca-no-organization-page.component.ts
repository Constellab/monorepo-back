import {Component, OnInit} from '@angular/core';
import {CaRouterService} from '../../../ca-core/service/ca-router.service';

/**
 * Page used when a user is not part of an organization
 */
@Component({
  selector: 'ca-no-organization-page',
  templateUrl: './ca-no-organization-page.component.html',
  styleUrls: ['./ca-no-organization-page.component.scss']
})
export class CaNoOrganizationPageComponent implements OnInit {

  loginRoute = CaRouterService.getLoginRoute();
  constructor() { }

  ngOnInit(): void {
  }

}
