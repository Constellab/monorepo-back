import {Component, Inject, OnInit} from '@angular/core';
import {FL_PORTAL_DATA} from '@monorepo/front-core-lib';
import {CaUser} from '../../../../model/entities/ca-user.class';
import {CaAuthenticatedUserService} from '../../../../service-api/ca-authenticated-user.service';
import {CaSpaceService} from '../../../../service-api/ca-space.service';

@Component({
  selector: 'ca-user-info-portal',
  templateUrl: './ca-user-info-portal.component.html',
  styleUrls: ['./ca-user-info-portal.component.scss']
})
export class CaUserInfoPortalComponent implements OnInit {

  user: CaUser;
  canSeeProfile: boolean = false;

  constructor(@Inject(FL_PORTAL_DATA) private data: CaUser,
              private authenticatedUserService: CaAuthenticatedUserService,
              private spaceService: CaSpaceService) {
    this.user = data;
  }

  ngOnInit(): void {
    this.spaceService.checkUsersHaveCommonSpace(this.authenticatedUserService.getUser().id, this.user.id).subscribe(
      (result) => {
        this.canSeeProfile = this.authenticatedUserService.getUser().isAdmin() || result;
      }
    );
  }


}
