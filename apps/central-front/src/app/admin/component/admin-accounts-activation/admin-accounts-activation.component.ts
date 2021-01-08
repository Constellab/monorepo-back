import {Component, OnInit} from '@angular/core';
import {User} from '../../../core/model/entities/user.class';
import {UserAccountsService} from '../../../core/service-api/user-accounts.service';
import {FlArrayObs, FlTableColumn} from '@monorepo/front-core-lib';

/**
 * admin component to activate user accounts
 */
@Component({
  selector: 'gen-admin-accounts-activation',
  templateUrl: './admin-accounts-activation.component.html',
  styleUrls: ['./admin-accounts-activation.component.scss']
})
export class AdminAccountsActivationComponent implements OnInit {

  accounts: FlArrayObs<User>;

  displayedColumns: FlTableColumn<User>[] = ['photo', 'fullname', 'email', 'phone', 'createdAt', 'customTemplate'];

  constructor(private accountService: UserAccountsService) {
  }

  ngOnInit(): void {
    this.findUsersToAdminActivate();
  }

  private findUsersToAdminActivate(): void {
    this.accounts = this.accountService.findUsersToAdminActivate();
  }

  onAccountActivated(user: User): void {
    this.accounts.removeItem(user);
  }

}
