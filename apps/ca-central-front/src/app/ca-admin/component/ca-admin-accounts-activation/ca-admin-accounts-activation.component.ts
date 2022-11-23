import {Component, OnInit} from '@angular/core';
import {CaUser, CaUserDatasourcePaginated} from '../../../ca-core/model/entities/ca-user.class';
import {CaUserAccountsService} from '../../../ca-core/service-api/ca-user-accounts.service';
import {FlTableColumn} from '@monorepo/front-core-lib';

/**
 * admin component to activate user accounts
 */
@Component({
  selector: 'ca-admin-accounts-activation',
  templateUrl: './ca-admin-accounts-activation.component.html',
  styleUrls: ['./ca-admin-accounts-activation.component.scss']
})
export class CaAdminAccountsActivationComponent implements OnInit {

  users: CaUserDatasourcePaginated = this.accountService.findUsersToAdminActivateDatasource();

  displayedColumns: FlTableColumn<CaUser>[] = ['photo', 'fullname', 'email', 'phone', 'createdAt', 'customTemplate'];

  constructor(private accountService: CaUserAccountsService) {
  }

  ngOnInit(): void {
  }

  onAccountActivated(user: CaUser): void {
    this.users.removeItem(user);
  }

}
