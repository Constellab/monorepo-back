import {Component, OnInit} from '@angular/core';
import {CaAuthenticationService} from '../../../ca-login/service/ca-authentication.service';
import {Router} from '@angular/router';

/**
 * Settings page
 */
@Component({
  selector: 'ca-settings-page',
  templateUrl: './ca-settings-page.component.html',
  styleUrls: ['./ca-settings-page.component.scss']
})
export class CaSettingsPageComponent implements OnInit {

  logoutIsLoading: boolean = false;

  constructor(private loginService: CaAuthenticationService,
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
