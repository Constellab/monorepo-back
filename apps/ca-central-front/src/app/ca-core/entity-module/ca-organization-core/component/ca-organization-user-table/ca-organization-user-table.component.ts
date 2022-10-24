import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {CaOrganizationUser, CaOrganizationUserDatasource} from '../../../../model/entities/ca-organization.class';
import {FlTableAbstractDirective} from '@monorepo/front-core-lib';

/**
 * Table to list the users of an organization
 */
@Component({
  selector: 'ca-organization-user-table',
  templateUrl: './ca-organization-user-table.component.html',
  styleUrls: ['./ca-organization-user-table.component.scss']
})
export class CaOrganizationUserTableComponent extends FlTableAbstractDirective<CaOrganizationUser>
  implements OnInit {

  @Input() datasource: CaOrganizationUserDatasource;

  @Output() removeUser: EventEmitter<CaOrganizationUser> = new EventEmitter();

  @Output() activateUser: EventEmitter<CaOrganizationUser> = new EventEmitter();

  @Output() deactivateUser: EventEmitter<CaOrganizationUser> = new EventEmitter();

  @Output() updateRole: EventEmitter<CaOrganizationUser> = new EventEmitter();

  constructor() {
    super(['user', 'role', 'active', 'actions']);
  }

  ngOnInit(): void {
  }

  onRemoveUser(user: CaOrganizationUser): void {
    this.removeUser.emit(user);
  }

  onActivateUser(user: CaOrganizationUser): void {
    this.activateUser.emit(user);
  }

  onDeactivateUser(user: CaOrganizationUser): void {
    this.deactivateUser.emit(user);
  }

  onUpdateRole(user: CaOrganizationUser): void {
    this.updateRole.emit(user);
  }

}
