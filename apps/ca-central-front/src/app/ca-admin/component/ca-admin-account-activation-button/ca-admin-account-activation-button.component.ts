import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {CaUser} from '../../../ca-core/model/entities/ca-user.class';
import {CaUserAccountsService} from '../../../ca-core/service-api/ca-user-accounts.service';
import {FlSnackBarService} from '@monorepo/front-core-lib';

/**
 * Button to admin activate a user
 */
@Component({
  selector: 'ca-admin-account-activation-button',
  templateUrl: './ca-admin-account-activation-button.component.html',
  styleUrls: ['./ca-admin-account-activation-button.component.scss']
})
export class CaAdminAccountActivationButtonComponent implements OnInit {

  @Input() user: CaUser;

  @Output() accountActivated: EventEmitter<CaUser> = new EventEmitter<CaUser>();

  isLoading: boolean = false;

  constructor(private accountService: CaUserAccountsService,
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

  private activateUserSuccess(user: CaUser): void {
    this.snackBarService.openSuccessMessage({text: 'admin_account_activated', translateText: true});
    this.isLoading = false;
    this.accountActivated.emit(user);
  }

}
