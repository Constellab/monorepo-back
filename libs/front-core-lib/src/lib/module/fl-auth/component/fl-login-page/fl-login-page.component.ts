import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {FlThemeService} from '../../../fl-theme/fl-theme.service';

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

  @Input() lightThemeLogo: string = 'assets/fl-logo/constellab-logo-text-black.svg';

  @Input() darkThemeLogo: string = 'assets/fl-logo/constellab-logo-text-white.svg';

  @Output() loginSuccess: EventEmitter<void> = new EventEmitter<void>();

  logo: string;

  constructor(private themeService: FlThemeService) {
  }

  ngOnInit(): void {
    this.logo = this.themeService.isDarkTheme() ? this.darkThemeLogo :
      this.lightThemeLogo;
  }

  onLoginSuccess(): void {
    this.loginSuccess.emit();
  }

}
