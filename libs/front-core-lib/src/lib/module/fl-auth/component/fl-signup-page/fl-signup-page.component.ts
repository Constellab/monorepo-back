import {Component, Input, OnInit} from '@angular/core';
import {FormGroup} from '@ngneat/reactive-forms';
import {Router} from '@angular/router';
import {FlSignUpUser} from '../../model/fl-sign-up-user.class';
import {FlThemeService} from '../../../fl-theme/fl-theme.service';
import {FlUserAccountService} from '../../service/fl-user-account.service';
import {FlSnackBarService} from '../../../fl-snack-bar/fl-snack-bar.service';
import {FlSignupFormComponent} from '../fl-signup-form/fl-signup-form.component';

@Component({
  selector: 'fl-signup-page',
  templateUrl: './fl-signup-page.component.html',
  styleUrls: ['./fl-signup-page.component.scss']
})
export class FlSignupPageComponent implements OnInit {

  /**
   * Redirection route after the signup is successful, do nothing if not provided
   */
  @Input() redirectionRoute?: string;

  @Input() lightThemeLogo: string = 'assets/fl-logo/constellab-logo-text-black.svg';

  @Input() darkThemeLogo: string = 'assets/fl-logo/constellab-logo-text-white.svg';

  logo: string;

  formGp: FormGroup<FlSignUpUser>;

  isLoading: boolean = false;

  constructor(private themeService: FlThemeService,
              private userAccountService: FlUserAccountService,
              private snackBarService: FlSnackBarService,
              private router: Router) { }

  ngOnInit(): void {
    this.logo = this.themeService.isDarkTheme() ? this.darkThemeLogo :
      this.lightThemeLogo;

    this.initForm();
  }

  private initForm(): void {
    this.formGp = FlSignupFormComponent.buildFormGroup();
  }

  submit(): void {
    if (this.formGp.valid && !this.isLoading) {
      this.signupUser(this.formGp.getRawValue());
    } else {
      this.formGp.markAllAsTouched();
    }
  }

  private signupUser(user: FlSignUpUser): void {
    this.isLoading = true;
    this.userAccountService.signup(user).subscribe({
      next: () => this.onSignupSuccess(),
      error: () => this.isLoading = false
    });
  }

  private onSignupSuccess(): void {
    this.snackBarService.openSuccessMessage({text: 'flAuth.account_created', translateText: true}, 10000);

    this.isLoading = false;

    if (this.redirectionRoute) {
      this.router.navigate([this.redirectionRoute]);
    }
  }

}
