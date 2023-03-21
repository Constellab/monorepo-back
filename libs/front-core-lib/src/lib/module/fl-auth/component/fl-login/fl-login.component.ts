import {Component, EventEmitter, OnInit, Output} from '@angular/core';
import {FormBuilder, FormGroup} from '@ngneat/reactive-forms';
import {CmCredentials} from '@monorepo/common-model';
import {FlAuthLoginResponse, FlAuthService} from '../../service/fl-auth.service';
import {Validators} from '@angular/forms';

/**
 * Form to call a login request using FlAuthService
 */
@Component({
  selector: 'fl-login',
  templateUrl: './fl-login.component.html',
  styleUrls: ['./fl-login.component.scss']
})
export class FlLoginComponent implements OnInit {


  @Output() loginSuccess: EventEmitter<FlAuthLoginResponse> = new EventEmitter<FlAuthLoginResponse>();

  formGp: FormGroup<CmCredentials>;
  isLoading = false;

  constructor(private authService: FlAuthService) {
  }

  ngOnInit(): void {
    this.initForm();
  }

  // Init the html form
  private initForm(): void {
    this.formGp = new FormBuilder().group({
      email: [null, [Validators.required, Validators.email]],
      password: [null, Validators.required]
    });
  }

  login(): void {
    if (this.formGp.valid) {
      this.isLoading = true;
      this.authService.login(this.formGp.getRawValue()).subscribe({
        next: response => this.onLoginSuccess(response),
        error: () => this.error()
      });
    } else {
      this.formGp.markAllAsTouched();
    }
  }

  private onLoginSuccess(response: FlAuthLoginResponse): void {
    this.isLoading = false;

    this.loginSuccess.next(response);
  }

  private error(): void {
    this.isLoading = false;
    this.formGp.get('password').reset();
  }

}
