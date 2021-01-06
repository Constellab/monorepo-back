import {Component, OnInit} from '@angular/core';
import {FormControl} from '@ngneat/reactive-forms';
import {MatDialogRef} from '@angular/material/dialog';
import {UserAccountsService} from '../../../core/service-api/user-accounts.service';
import {SnackBarService} from '../../../core/service/snack-bar.service';
import {Validators} from '@angular/forms';

/**
 * Dialog with a simple form where the user enter his email to receive the
 * password forgotten email
 */
@Component({
  selector: 'gen-password-forgotten',
  templateUrl: './password-forgotten.component.html',
  styleUrls: ['./password-forgotten.component.scss']
})
export class PasswordForgottenComponent implements OnInit {

  formControl: FormControl<string>;

  isLoading: boolean = false;

  constructor(private dialogRef: MatDialogRef<PasswordForgottenComponent>,
              private userAccountsService: UserAccountsService,
              private snackBarService: SnackBarService) {
  }

  ngOnInit(): void {
    this.formControl = new FormControl<string>(null, [Validators.required, Validators.email]);
  }

  submit(): void {
    if (this.formControl.valid && !this.isLoading) {
      this.callPasswordForgotten(this.formControl.value);
    }
  }

  private callPasswordForgotten(email: string): void {
    this.isLoading = true;
    this.userAccountsService.passwordForgotten(email).subscribe(
      () => this.onSuccess(),
      () => this.isLoading = false
    );
  }

  private onSuccess(): void {
    this.snackBarService.openSuccessMessage('password_forgotten_mail_sent', true, 7000);

    this.dialogRef.close();
  }

}
