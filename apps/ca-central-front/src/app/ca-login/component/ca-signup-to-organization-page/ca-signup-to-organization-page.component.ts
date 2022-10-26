import {Component, OnInit} from '@angular/core';
import {FormGroup} from '@ngneat/reactive-forms';
import {FlLoginFormComponent, FlSignupFormComponent, FlSignUpUser, FlSnackBarService} from '@monorepo/front-core-lib';
import {CmCredentials} from '@monorepo/common-model';
import {CaOrganizationInvitService} from '../../../ca-core/service-api/ca-organization-invit.service';
import {ActivatedRoute} from '@angular/router';
import {CaRouterService} from '../../../ca-core/service/ca-router.service';
import {CaAuthenticationService} from '../../service/ca-authentication.service';
import {CaOrganizationInvitFull} from '../../../ca-core/model/entities/ca-organization-invit.class';
import {Observable, tap} from 'rxjs';

/**
 * Page on which the user can join an organization. He can create an account or use an existing one.
 */
@Component({
  selector: 'ca-signup-to-organization-page',
  templateUrl: './ca-signup-to-organization-page.component.html',
  styleUrls: ['./ca-signup-to-organization-page.component.scss']
})
export class CaSignupToOrganizationPageComponent implements OnInit {

  invitation$: Observable<CaOrganizationInvitFull>;
  invitationCode: string;

  signupFormGp: FormGroup<FlSignUpUser>;
  signInFormGp: FormGroup<CmCredentials>;

  signupIsLoading: boolean = false;
  signInIsLoading: boolean = false;

  constructor(private route: ActivatedRoute,
              private organizationInvitService: CaOrganizationInvitService,
              private snackBarService: FlSnackBarService,
              private routerService: CaRouterService,
              private authenticationService: CaAuthenticationService) {
  }

  ngOnInit(): void {
    this.route.params.subscribe(
      params => this.getInvitation(params.code)
    );
  }

  private getInvitation(code: string): void {
    this.invitationCode = code;
    this.invitation$ = this.organizationInvitService.getInvitationByCode(code).pipe(
      tap(invitation => this.getInvitationSuccess(invitation))
    );
  }

  private getInvitationSuccess(invitation: CaOrganizationInvitFull): void {

    this.signupFormGp = FlSignupFormComponent.buildFormGroup();
    this.signupFormGp.get('email').setValue(invitation.userMail);
    this.signupFormGp.get('email').disable();

    this.signInFormGp = FlLoginFormComponent.buildFormGroup();
    this.signInFormGp.get('email').setValue(invitation.userMail);
    this.signInFormGp.get('email').disable();
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
    this.organizationInvitService.acceptInvitationNewUser(this.invitationCode, user).subscribe({
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
    if (this.signInFormGp.valid && !this.signInIsLoading && !this.signupIsLoading) {
      this.signIn(this.signInFormGp.getRawValue());
    } else {
      this.signInFormGp.markAllAsTouched();
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
    this.routerService.navigateToJoinOrganization(this.invitationCode);
    this.signInIsLoading = false;
  }
}
