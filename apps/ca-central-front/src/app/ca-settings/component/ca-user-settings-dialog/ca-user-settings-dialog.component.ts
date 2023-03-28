import {Component, OnInit} from '@angular/core';
import {CaAuthService} from '../../../ca-login/service/ca-auth.service';
import {Router} from '@angular/router';
import {CaEnvironmentHelper} from '../../../ca-core/utils/ca-environment.helper';

/**
 * Settings page
 */
@Component({
  selector: 'ca-user-settings-dialog',
  templateUrl: './ca-user-settings-dialog.component.html',
  styleUrls: ['./ca-user-settings-dialog.component.scss']
})
export class CaUserSettingsDialogComponent implements OnInit {

  logoutIsLoading: boolean = false;

  constructor(private authService: CaAuthService,
              private router: Router) {
  }

  ngOnInit(): void {

  }

  logout(): void {
    this.logoutIsLoading = true;
    this.authService.logout().subscribe({
      next: () => this.logoutSuccess(),
      error: () => this.logoutIsLoading = false
    });
  }

  private logoutSuccess(): void {
    if (window && CaEnvironmentHelper.isProduction()) {
      window.location.href = `https://${CaEnvironmentHelper.getFrontDomain()}`;
    } else {
      this.router.navigate(['/']);
    }
    this.logoutIsLoading = false;
  }

}
