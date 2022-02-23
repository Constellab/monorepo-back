import {Component, OnInit} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {FormBuilder, FormGroup} from '@ngneat/reactive-forms';
import {first} from 'rxjs/operators';
import {Validators} from '@angular/forms';
import {FlUserAccountService} from '../../service/fl-user-account.service';
import {FlSnackBarService} from '../../../fl-snack-bar/fl-snack-bar.service';
import {FlGlobalValidators} from '../../../../utils/fl-global.validators';

interface FlResetPasswordForm {
  password: string;
  repeatPassword: string;
}


@Component({
  selector: 'fl-reset-password-page',
  templateUrl: './fl-reset-password-page.component.html',
  styleUrls: ['./fl-reset-password-page.component.scss']
})
export class FlResetPasswordPageComponent implements OnInit {

  formGp: FormGroup<FlResetPasswordForm>;

  isLoading: boolean = false;

  constructor(private route: ActivatedRoute,
              private userAccountService: FlUserAccountService,
              private snackBarService: FlSnackBarService,
              private router: Router) {
  }

  ngOnInit(): void {
    this.initForm();
  }

  private initForm(): void {
    const fb = new FormBuilder();
    this.formGp = fb.group({
      password: [null, [Validators.required, FlGlobalValidators.passwordValidator()]],
      repeatPassword: [null, [Validators.required,
        FlGlobalValidators.repeatPasswordValidator('password')]],
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
    this.snackBarService.openSuccessMessage({text:'flAuth.password_changed',  translateText: true});

    this.isLoading = false;
    this.router.navigate(['/']);
  }

}
