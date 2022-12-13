import {Component, OnInit} from '@angular/core';
import {CaRouterService} from '../../../ca-core/service/ca-router.service';

/**
 * Global page for admin
 */
@Component({
  selector: 'ca-admin-page',
  templateUrl: './ca-admin-page.component.html',
  styleUrls: ['./ca-admin-page.component.scss']
})
export class CaAdminPageComponent implements OnInit {

  adminRoute = CaRouterService.getAdminRoute();

  adminSpacesRoute = CaRouterService.getAdminSpacesRoute();
  adminUsersRoute = CaRouterService.getAdminUsersRoute();
  adminLabsRoute = CaRouterService.getAdminLabsRoute();
  adminServersRoute = CaRouterService.getAdminServersRoute();

  constructor() {
  }

  ngOnInit(): void {
  }

}
