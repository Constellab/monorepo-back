import {Component, OnInit} from '@angular/core';
import {FormControl} from '@ngneat/reactive-forms';
import {Validators} from '@angular/forms';
import {FlUserAccountService} from '../../service/fl-user-account.service';
import {FlSnackBarService} from '../../../fl-snack-bar/fl-snack-bar.service';
import {MatDialogRef} from '@angular/material/dialog';

/**
 * Dialog with a simple form where the user enter his email to receive the
 * password forgotten email
 */
@Component({
  selector: 'fl-password-forgotten',
  templateUrl: './fl-password-forgotten.component.html',
  styleUrls: ['./fl-password-forgotten.component.scss']
})
export class FlPasswordForgottenComponent implements OnInit {

  formControl: FormControl<string>;

  isLoading: boolean = false;

  constructor(private dialogRef: MatDialogRef<FlPasswordForgottenComponent>,
              private userAccountsService: FlUserAccountService,
              private snackBarService: FlSnackBarService) {
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
    this.snackBarService.openSuccessMessage({text:'flAuth.password_forgotten_mail_sent',  translateText: true}, 7000);

    this.dialogRef.close();
  }

}
