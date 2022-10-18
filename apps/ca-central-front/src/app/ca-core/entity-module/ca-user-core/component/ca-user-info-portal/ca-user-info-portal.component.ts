import {Component, Inject, OnInit} from '@angular/core';
import {FL_PORTAL_DATA} from '@monorepo/front-core-lib';
import {CaUser} from '../../../../model/entities/ca-user.class';
import {CaAuthenticatedUserService} from '../../../../service-api/ca-authenticated-user.service';

@Component({
  selector: 'ca-user-info-portal',
  templateUrl: './ca-user-info-portal.component.html',
  styleUrls: ['./ca-user-info-portal.component.scss']
})
export class CaUserInfoPortalComponent implements OnInit {

  user: CaUser;
  inTheSameOrganisation: boolean;

  constructor(@Inject(FL_PORTAL_DATA) private data: CaUser, private authenticatedUserService: CaAuthenticatedUserService) {
    this.user = data;
  }

  ngOnInit(): void {

    //TODO: Only show redirection button if users are in the same organisation
  }

}
