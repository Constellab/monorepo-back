import {Component, OnInit} from '@angular/core';
import {CaAuthenticatedUserService} from '../../../ca-core/service-api/ca-authenticated-user.service';
import {FlConfirmDialogResult, FlDialogService} from '@monorepo/front-core-lib';
import {ThemePalette} from '@angular/material/core';

/**
 * Component to activate or deactivate two factor authentication
 */
@Component({
  selector: 'ca-user-two-fa-toggle',
  templateUrl: './ca-user-two-fa-toggle.component.html',
  styleUrls: ['./ca-user-two-fa-toggle.component.scss']
})
export class CaUserTwoFaToggleComponent implements OnInit {

  twoFaEnabled: boolean;
  isLoading: boolean;

  constructor(private authenticatedUserService: CaAuthenticatedUserService,
              private dialogService: FlDialogService) {
  }

  ngOnInit(): void {
    this.getTwoFaStatus();
  }

  private getTwoFaStatus(): void {
    this.isLoading = true;
    this.authenticatedUserService.has2FA().subscribe({
      next: twoFaEnabled => this.getSuccess(twoFaEnabled),
      error: () => this.isLoading = false
    });
  }

  private getSuccess(twoFaEnabled: boolean): void {
    this.twoFaEnabled = twoFaEnabled;
    this.isLoading = false;
  }

  get text(): string{
    return this.twoFaEnabled ? 'two_fa_is_enabled' : 'two_fa_is_disabled';
  }

  get buttonText(): string {
    return this.twoFaEnabled ? 'deactivate_two_fa' : 'activate_two_fa';
  }

  get buttonColor(): ThemePalette{
    return this.twoFaEnabled ? 'warn' : 'primary';
  }

  toggleTwoFa(): void {
    if (this.twoFaEnabled) {
      this.deactivateTwoFa();
    } else {
      this.activateTwoFa();
    }
  }

  private activateTwoFa(): void {
    this.dialogService.openConfirmDialog({
      title: 'activate_two_fa',
      content: 'activate_two_fa_confirmation',
      translateTitleAndContent: true,
      observable: this.authenticatedUserService.set2FA(true),
      successMessage: 'two_fa_enabled',
      translateMessage: true
    }).afterClosed().subscribe(
      result => this.onActivateTwoFaClosed(result)
    );
  }

  private onActivateTwoFaClosed(result: FlConfirmDialogResult<boolean>): void{
    if (result.choice) {
      this.twoFaEnabled = true;
    }
  }

  private deactivateTwoFa(): void {
    this.dialogService.openConfirmDialog({
      title: 'deactivate_two_fa',
      content: 'deactivate_two_fa_confirmation',
      translateTitleAndContent: true,
      observable: this.authenticatedUserService.set2FA(false),
      successMessage: 'two_fa_disabled',
      translateMessage: true
    }).afterClosed().subscribe(
      result => this.onDeactivateTwoFaClosed(result)
    );
  }

  private onDeactivateTwoFaClosed(result: FlConfirmDialogResult<boolean>): void{
    if (result.choice) {
      this.twoFaEnabled = false;
    }
  }

}
