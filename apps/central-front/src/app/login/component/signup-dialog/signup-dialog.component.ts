import {Component, OnInit} from '@angular/core';
import {FormBuilder, FormGroup} from '@ngneat/reactive-forms';
import {NewUser} from '../../../core/model/entities/user.class';
import {Validators} from '@angular/forms';
import {GlobalValidators} from '../../../core/utils/global.validators';
import {SnackBarService} from '../../../core/service/snack-bar.service';
import {MatDialogRef} from '@angular/material/dialog';
import {UserAccountsService} from '../../../core/service-api/user-accounts.service';

/**
 * Signup dialog to create a new user
 */
@Component({
  selector: 'gen-signup-dialog',
  templateUrl: './signup-dialog.component.html',
  styleUrls: ['./signup-dialog.component.scss']
})
export class SignupDialogComponent implements OnInit {

  formGp: FormGroup<NewUser>;

  isLoading: boolean = false;

  constructor(private userAccountService: UserAccountsService,
              private snackBarService: SnackBarService,
              private dialogRef: MatDialogRef<SignupDialogComponent>) {
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
      password: [null, [Validators.required, GlobalValidators.passwordValidator()]],
      repeatPassword: [null, [Validators.required,
        GlobalValidators.repeatPasswordValidator('password')]],
      phone: [null, Validators.required],
      category: [null, Validators.required],
    });
  }

  submit(): void {
    if (this.formGp.valid && !this.isLoading) {
      this.signupUser(this.formGp.getRawValue());
    }
  }

  private signupUser(user: NewUser): void {
    this.isLoading = true;
    this.userAccountService.signup(user).subscribe(
      () => this.onSignupSuccess(),
      () => this.isLoading = false
    );
  }

  private onSignupSuccess(): void {
    this.snackBarService.openSuccessMessage('account_created', true, 10000);

    this.dialogRef.close();
    this.isLoading = false;
  }

}
