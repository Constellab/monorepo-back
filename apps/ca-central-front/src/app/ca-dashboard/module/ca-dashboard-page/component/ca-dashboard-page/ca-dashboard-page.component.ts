import {Component, OnInit} from '@angular/core';
import {CaUser} from '../../../../../ca-core/model/entities/ca-user.class';
import {CaAuthenticatedUserService} from '../../../../../ca-core/service-api/ca-authenticated-user.service';

/**
 * Page containing the user dashboard
 */
@Component({
  selector: 'ca-dashboard-page',
  templateUrl: './ca-dashboard-page.component.html',
  styleUrls: ['./ca-dashboard-page.component.scss']
})
export class CaDashboardPageComponent implements OnInit {

  authenticatedUser: CaUser;

  currentDate: Date = new Date();

  constructor(authenticatedUserService: CaAuthenticatedUserService) {
    this.authenticatedUser = authenticatedUserService.getUser();
  }

  ngOnInit(): void {

  }

}
