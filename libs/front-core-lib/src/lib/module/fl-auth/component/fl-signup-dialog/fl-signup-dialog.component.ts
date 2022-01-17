import {Component, OnInit} from '@angular/core';
import {FormBuilder, FormGroup} from '@ngneat/reactive-forms';
import {Validators} from '@angular/forms';
import {MatDialogRef} from '@angular/material/dialog';
import {FlSignUpUser} from '../../model/fl-sign-up-user.class';
import {FlUserAccountService} from '../../service/fl-user-account.service';
import {FlSnackBarService} from '../../../fl-snack-bar/fl-snack-bar.service';
import {FlGlobalValidators} from '../../../../utils/fl-global.validators';

/**
 * Signup dialog to create a new user
 */
@Component({
  selector: 'fl-signup-dialog',
  templateUrl: './fl-signup-dialog.component.html',
  styleUrls: ['./fl-signup-dialog.component.scss']
})
export class FlSignupDialogComponent implements OnInit {

  formGp: FormGroup<FlSignUpUser>;

  isLoading: boolean = false;

  constructor(private userAccountService: FlUserAccountService,
              private snackBarService: FlSnackBarService,
              private dialogRef: MatDialogRef<FlSignupDialogComponent>) {
  }

  ngOnInit(): void {
    this.initForm();
  }

  private initForm(): void {
    const fb = new FormBuilder();
    this.formGp = fb.group({
      firstname: [null, Validators.required],
      lastname: [null, Validators.required],
      email: [null, [Validators.required, Validators.email]],
      password: [null, [Validators.required, FlGlobalValidators.passwordValidator()]],
      repeatPassword: [null, [Validators.required,
        FlGlobalValidators.repeatPasswordValidator('password')]],
      category: [null, Validators.required],
      validateCGU: [false, FlGlobalValidators.isValue(true)]
    });
  }

  submit(): void {
    if (this.formGp.valid && !this.isLoading) {
      this.signupUser(this.formGp.getRawValue());
    } else {
      this.formGp.get('validateCGU').markAsTouched();
    }
  }

  private signupUser(user: FlSignUpUser): void {
    this.isLoading = true;
    this.userAccountService.signup(user).subscribe(
      () => this.onSignupSuccess(),
      () => this.isLoading = false
    );
  }

  private onSignupSuccess(): void {
    this.snackBarService.openSuccessMessage('flAuth.account_created', true, 10000);

    this.dialogRef.close();
    this.isLoading = false;
  }

  // update the repeat password validity on password change
  updateRepeatPasswordValidity(): void {
    this.formGp.get('repeatPassword').updateValueAndValidity();
  }
}
