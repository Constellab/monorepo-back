import {Component, OnInit} from '@angular/core';
import {ArrayObs} from '../../../core/model/datasource/array-obs.class';
import {User} from '../../../core/model/entities/user.class';
import {UserAccountsService} from '../../../core/service-api/user-accounts.service';
import {TableColumn} from '../../../core/abstract-directive/table-abstract.directive';

/**
 * admin component to activate user accounts
 */
@Component({
  selector: 'gen-admin-accounts-activation',
  templateUrl: './admin-accounts-activation.component.html',
  styleUrls: ['./admin-accounts-activation.component.scss']
})
export class AdminAccountsActivationComponent implements OnInit {

  accounts: ArrayObs<User>;

  displayedColumns: TableColumn<User>[] = ['photo', 'fullname', 'email', 'phone', 'createdAt', 'customTemplate'];

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
