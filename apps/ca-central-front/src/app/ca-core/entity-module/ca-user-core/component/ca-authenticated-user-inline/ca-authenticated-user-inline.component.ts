import {Component, Input, OnInit} from '@angular/core';
import {CaUser} from '../../../../model/entities/ca-user.class';
import {CaAuthenticatedUserService} from '../../../../service-api/ca-authenticated-user.service';
import {CaRouterService} from '../../../../service/ca-router.service';

/**
 * Component to display the current user photo, name and job
 */
@Component({
  selector: 'ca-authenticated-user-inline',
  templateUrl: './ca-authenticated-user-inline.component.html',
  styleUrls: ['./ca-authenticated-user-inline.component.scss']
})
export class CaAuthenticatedUserInlineComponent implements OnInit {

  @Input() showName: boolean = true;

  authenticatedUser: CaUser;

  route: string;

  constructor(private authenticatedUserService: CaAuthenticatedUserService) {
  }

  ngOnInit(): void {
    this.authenticatedUser = this.authenticatedUserService.getUser();
    this.route = CaRouterService.getUserDetailRoute(this.authenticatedUser.id);
  }

}
