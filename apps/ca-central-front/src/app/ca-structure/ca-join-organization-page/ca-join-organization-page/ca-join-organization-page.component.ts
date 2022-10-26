import {Component, OnInit} from '@angular/core';
import {Observable} from 'rxjs';
import {CaOrganizationInvitFull} from '../../../ca-core/model/entities/ca-organization-invit.class';
import {CaOrganizationInvitService} from '../../../ca-core/service-api/ca-organization-invit.service';
import {ActivatedRoute} from '@angular/router';
import {CaOrganizationService} from '../../../ca-core/service-api/ca-organization.service';
import {FlSnackBarService} from '@monorepo/front-core-lib';
import {CaRouterService} from '../../../ca-core/service/ca-router.service';

/**
 * Component to join an organization when the user already have an account and is logged in.
 */
@Component({
  selector: 'ca-join-organization-page',
  templateUrl: './ca-join-organization-page.component.html',
  styleUrls: ['./ca-join-organization-page.component.scss']
})
export class CaJoinOrganizationPageComponent implements OnInit {

  invitation$: Observable<CaOrganizationInvitFull>;

  invitationCode: string;

  acceptIsLoading: boolean = false;

  constructor(private organizationInvitService: CaOrganizationInvitService,
              private organizationService: CaOrganizationService,
              private route: ActivatedRoute,
              private snackBarService: FlSnackBarService,
              private routerService: CaRouterService) {
  }

  ngOnInit(): void {
    this.route.params.subscribe(
      params => this.init(params.code)
    );
  }

  private init(code: string): void {
    this.invitationCode = code;
    this.invitation$ = this.organizationInvitService.getInvitationByCode(code);
  }

  acceptInvitation(): void {
    this.acceptIsLoading = true;
    this.organizationInvitService.acceptInvitationExistingUser(this.invitationCode).subscribe({
      next: () => this.acceptInvitationSuccess(),
      error: () => this.acceptIsLoading = false
    });
  }

  private acceptInvitationSuccess(): void {
    this.acceptIsLoading = false;
    this.snackBarService.openSuccessMessage({text: 'join_organization_existing_user_success', translateText: true});
    this.routerService.navigateToDashboard();
  }

}
