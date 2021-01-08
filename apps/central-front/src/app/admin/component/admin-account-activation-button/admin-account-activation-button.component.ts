import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {User} from '../../../core/model/entities/user.class';
import {UserAccountsService} from '../../../core/service-api/user-accounts.service';
import {FlSnackBarService} from '@monorepo/front-core-lib';

/**
 * Button to admin activate a user
 */
@Component({
  selector: 'gen-admin-account-activation-button',
  templateUrl: './admin-account-activation-button.component.html',
  styleUrls: ['./admin-account-activation-button.component.scss']
})
export class AdminAccountActivationButtonComponent implements OnInit {

  @Input() user: User;

  @Output() accountActivated: EventEmitter<User> = new EventEmitter<User>();

  isLoading: boolean = false;

  constructor(private accountService: UserAccountsService,
              private snackBarService: FlSnackBarService) {
  }

  ngOnInit(): void {
  }

  activateUserAccount(): void {
    this.isLoading = true;
    this.accountService.adminActivateUser(this.user.id).subscribe(
      user => this.activateUserSuccess(user),
      () => this.isLoading = false
    );
  }

  private activateUserSuccess(user: User): void {
    this.snackBarService.openSuccessMessage('admin_account_activated', true);
    this.isLoading = false;
    this.accountActivated.emit(user);
  }

}
