import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';

@Component({
  selector: 'fl-login-page',
  templateUrl: './fl-login-page.component.html',
  styleUrls: ['./fl-login-page.component.scss']
})
export class FlLoginPageComponent implements OnInit {

  /**
   * Redirection route after the login is successful, do nothing if not provided
   */
  @Input() redirectionRoute?: string;

  /**
   * If true the password reset link and signup link are hidden
   */
  @Input() hideLoginFooter: boolean = false;

  @Output() loginSuccess: EventEmitter<void> = new EventEmitter<void>();

  constructor() {
  }

  ngOnInit(): void {
  }

  onLoginSuccess(): void {
    this.loginSuccess.emit();
  }

}
