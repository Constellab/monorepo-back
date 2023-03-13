import {Component, OnInit} from '@angular/core';
import {FormGroup} from '@ngneat/reactive-forms';
import {MatLegacyDialogRef as MatDialogRef} from '@angular/material/legacy-dialog';
import {FlSignUpUser} from '../../model/fl-sign-up-user.class';
import {FlUserAccountService} from '../../service/fl-user-account.service';
import {FlSnackBarService} from '../../../fl-snack-bar/fl-snack-bar.service';
import {FlSignupFormComponent} from '../fl-signup-form/fl-signup-form.component';

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
    this.userAccountService.signup(user).subscribe(
      () => this.onSignupSuccess(),
      () => this.isLoading = false
    );
  }

  private onSignupSuccess(): void {
    this.snackBarService.openSuccessMessage({text: 'flAuth.account_created', translateText: true}, 10000);

    this.dialogRef.close();
    this.isLoading = false;
  }
}
