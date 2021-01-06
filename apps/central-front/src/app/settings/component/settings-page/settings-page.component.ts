import {Component, OnInit} from '@angular/core';
import {AuthenticationService} from '../../../login/service/authentication.service';
import {Router} from '@angular/router';

/**
 * Settings page
 */
@Component({
  selector: 'gen-settings-page',
  templateUrl: './settings-page.component.html',
  styleUrls: ['./settings-page.component.scss']
})
export class SettingsPageComponent implements OnInit {

  logoutIsLoading: boolean = false;

  constructor(private loginService: AuthenticationService,
              private router: Router) {
  }

  ngOnInit(): void {
  }

  logout(): void {
    this.logoutIsLoading = true;
    this.loginService.logout().subscribe(
      () => this.logoutSuccess(),
      () => this.logoutIsLoading = false
    );
  }

  private logoutSuccess(): void {
    this.router.navigate(['/']);
    this.logoutIsLoading = false;
  }

}
