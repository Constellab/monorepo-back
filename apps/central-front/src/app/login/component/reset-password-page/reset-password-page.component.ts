import {Component, OnInit} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {UserAccountsService} from '../../../core/service-api/user-accounts.service';
import {SnackBarService} from '../../../core/service/snack-bar.service';
import {FormBuilder, FormGroup} from '@ngneat/reactive-forms';
import {first} from 'rxjs/operators';
import {Validators} from '@angular/forms';
import {GlobalValidators} from '../../../core/utils/global.validators';

interface ResetPasswordForm {
  password: string;
  repeatPassword: string;
}


@Component({
  selector: 'gen-reset-password-page',
  templateUrl: './reset-password-page.component.html',
  styleUrls: ['./reset-password-page.component.scss']
})
export class ResetPasswordPageComponent implements OnInit {

  formGp: FormGroup<ResetPasswordForm>;

  isLoading: boolean = false;

  constructor(private route: ActivatedRoute,
              private userAccountService: UserAccountsService,
              private snackBarService: SnackBarService,
              private router: Router) {
  }

  ngOnInit(): void {
    this.initForm();
  }

  private initForm(): void {
    const fb = new FormBuilder();
    this.formGp = fb.group({
      password: [null, [Validators.required, GlobalValidators.passwordValidator()]],
      repeatPassword: [null, [Validators.required,
        GlobalValidators.repeatPasswordValidator('password')]],
    });
  }

  submit(): void {
    if (this.formGp.valid && !this.isLoading) {
      this.isLoading = true;
      const password: string = this.formGp.value.password;

      // get the token from URL and call reset password
      this.route.params.pipe(first()).subscribe(
        params => this.resetPassword(password, params.token)
      );
    }
  }

  private resetPassword(password: string, token: string): void {
    this.userAccountService.resetPassword(password, token).subscribe(
      () => this.resetSuccess(),
      () => this.isLoading = false
    );
  }

  private resetSuccess(): void {
    this.snackBarService.openSuccessMessage('password_changed', true);

    this.isLoading = false;
    this.router.navigate(['/']);
  }

}
