import {Component, OnInit} from '@angular/core';
import {User} from '../../../../../core/model/entities/user.class';
import {AuthenticatedUserService} from '../../../../../core/service-api/authenticated-user.service';

/**
 * Page containing the user dashboard
 */
@Component({
  selector: 'gen-dashboard-page',
  templateUrl: './dashboard-page.component.html',
  styleUrls: ['./dashboard-page.component.scss']
})
export class DashboardPageComponent implements OnInit {

  authenticatedUser: User;

  currentDate: Date = new Date();

  constructor(authenticatedUserService: AuthenticatedUserService) {
    this.authenticatedUser = authenticatedUserService.getUser();
  }

  ngOnInit(): void {

  }

}
