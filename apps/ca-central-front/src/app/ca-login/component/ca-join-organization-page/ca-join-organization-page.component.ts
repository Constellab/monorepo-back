import {Component, OnInit} from '@angular/core';
import {FormGroup} from '@ngneat/reactive-forms';
import {
  FlLoginFormComponent,
  FlServerError,
  FlSignupFormComponent,
  FlSignUpUser,
  FlSnackBarService
} from '@monorepo/front-core-lib';
import {CmCredentials} from '@monorepo/common-model';
import {CaOrganizationInvitService} from '../../../ca-core/service-api/ca-organization-invit.service';
import {ActivatedRoute} from '@angular/router';
import {CaRouterService} from '../../../ca-core/service/ca-router.service';
import {CaAuthenticationService} from '../../service/ca-authentication.service';
import {CaOrganizationInvitFull} from '../../../ca-core/model/entities/ca-organization-invit.class';
import {CaOrganizationService} from '../../../ca-core/service-api/ca-organization.service';

/**
 * Page on which the user can join an organization. He can create an account or use an existing one.
 */
@Component({
  selector: 'ca-join-organization-page',
  templateUrl: './ca-join-organization-page.component.html',
  styleUrls: ['./ca-join-organization-page.component.scss']
})
export class CaJoinOrganizationPageComponent implements OnInit {

  invitation: CaOrganizationInvitFull;
  invitationIsLoading: boolean = false;
  invitationError: string;

  signupFormGp: FormGroup<FlSignUpUser>;
  signInFormGp: FormGroup<CmCredentials>;

  signupIsLoading: boolean = false;
  signInIsLoading: boolean = false;

  organizationPhoto: string;

  constructor(private route: ActivatedRoute,
              private organizationInvitService: CaOrganizationInvitService,
              private snackBarService: FlSnackBarService,
              private routerService: CaRouterService,
              private authenticationService: CaAuthenticationService,
              private organizationService: CaOrganizationService) {
  }

  ngOnInit(): void {
    this.route.params.subscribe(
      params => this.getInvitation(params.invitId)
    );
  }

  private getInvitation(id: string): void {
    this.invitationIsLoading = true;
    this.organizationInvitService.getInvitation(id).subscribe({
      next: (invitation) => this.getInvitationSuccess(invitation),
      error: (error) => this.getInvitationError(error)
    });
  }

  private getInvitationSuccess(invitation: CaOrganizationInvitFull): void {
    this.invitation = invitation;

    this.signupFormGp = FlSignupFormComponent.buildFormGroup();
    this.signupFormGp.get('email').setValue(invitation.userMail);
    this.signupFormGp.get('email').disable();

    this.signInFormGp = FlLoginFormComponent.buildFormGroup();
    this.signInFormGp.get('email').setValue(invitation.userMail);
    this.signInFormGp.get('email').disable();

    if (invitation.organization.photo) {
      this.organizationPhoto = this.organizationService.getOrganizationPhoto(
        invitation.organization.photo);
    }
    this.invitationIsLoading = false;
  }

  private getInvitationError(error: FlServerError): void {
    this.invitationError = error.logDetail.message;
    this.invitationIsLoading = false;
  }

  signupSubmit(): void {
    if (this.signupFormGp.valid && !this.signupIsLoading && !this.signInIsLoading) {
      this.signup(this.signupFormGp.getRawValue());
    } else {
      this.signupFormGp.markAllAsTouched();
    }
  }

  private signup(user: FlSignUpUser): void {
    this.signupIsLoading = true;
    this.organizationInvitService.acceptInvitationNewUser(this.invitation.id, user).subscribe({
      next: () => this.signupSuccess(),
      error: () => this.signupIsLoading = false
    });
  }

  private signupSuccess(): void {
    this.snackBarService.openSuccessMessage(
      {text: 'join_organization_new_user_success', translateText: true}, 7000);
    this.routerService.navigatorToLoginRoute();
    this.signupIsLoading = false;
  }

  signInSubmit(): void {
    if (this.signupFormGp.valid && !this.signInIsLoading && !this.signupIsLoading) {
      this.signIn(this.signInFormGp.getRawValue());
    } else {
      this.signupFormGp.markAllAsTouched();
    }
  }

  private signIn(credentials: CmCredentials): void {
    this.signInIsLoading = true;
    this.authenticationService.login(credentials).subscribe({
      next: () => this.signInSuccess(),
      error: () => this.signInIsLoading = false
    });
  }

  private signInSuccess(): void {
    // this.routerService.na
    // TODO navigate to join organization route
    this.signInIsLoading = false;
  }
}
