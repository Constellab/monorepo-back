import {Component, OnInit} from '@angular/core';
import {FormGroup} from '@ngneat/reactive-forms';
import {FlSignupFormComponent, FlSignUpUser, FlSnackBarService} from '@monorepo/front-core-lib';
import {CaSpaceInvitService} from '../../../ca-core/service-api/ca-space-invit.service';
import {ActivatedRoute} from '@angular/router';
import {CaRouterService} from '../../../ca-core/service/ca-router.service';
import {CaSpaceInvitFull} from '../../../ca-core/model/entities/ca-space-invit.class';
import {Observable, tap} from 'rxjs';
import {CaUserAccountsService} from '../../../ca-core/service-api/ca-user-accounts.service';

/**
 * Page on which the user can join an space. He can create an account or use an existing one.
 */
@Component({
  selector: 'ca-signup-to-space-page',
  templateUrl: './ca-signup-to-space-page.component.html',
  styleUrls: ['./ca-signup-to-space-page.component.scss']
})
export class CaSignupToSpacePageComponent implements OnInit {

  invitation$: Observable<CaSpaceInvitFull>;
  invitationCode: string;

  signupFormGp: FormGroup<FlSignUpUser>;

  signupIsLoading: boolean = false;

  constructor(private route: ActivatedRoute,
              private spaceInvitService: CaSpaceInvitService,
              private snackBarService: FlSnackBarService,
              private routerService: CaRouterService,
              private userAccountService: CaUserAccountsService) {
  }

  ngOnInit(): void {
    this.route.params.subscribe(
      params => this.getInvitation(params.code)
    );
  }

  private getInvitation(code: string): void {
    this.invitationCode = code;
    this.invitation$ = this.spaceInvitService.getInvitationByCode(code).pipe(
      tap(invitation => this.getInvitationSuccess(invitation))
    );
  }

  private getInvitationSuccess(invitation: CaSpaceInvitFull): void {

    this.signupFormGp = FlSignupFormComponent.buildFormGroup();
    this.signupFormGp.get('email').setValue(invitation.userMail);
    this.signupFormGp.get('email').disable();

  }


  signupSubmit(): void {
    if (this.signupFormGp.valid && !this.signupIsLoading) {
      this.signup(this.signupFormGp.getRawValue());
    } else {
      this.signupFormGp.markAllAsTouched();
    }
  }

  private signup(user: FlSignUpUser): void {
    this.signupIsLoading = true;
    this.userAccountService.createUserAndJoinSpace(this.invitationCode, user).subscribe({
      next: () => this.signupSuccess(),
      error: () => this.signupIsLoading = false
    });
  }

  private signupSuccess(): void {
    this.snackBarService.openSuccessMessage(
      {text: 'join_space_new_user_success', translateText: true}, 7000);
    this.routerService.navigatorToLoginRoute();
    this.signupIsLoading = false;
  }

  loginSuccess(): void {
    this.routerService.navigateToJoinSpace(this.invitationCode);
  }
}
