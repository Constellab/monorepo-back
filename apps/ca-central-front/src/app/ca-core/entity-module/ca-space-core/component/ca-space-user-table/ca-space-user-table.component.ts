import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {CaSpaceUser, CaSpaceUserDatasource} from '../../../../model/entities/ca-space.class';
import {FlTableAbstractDirective} from '@monorepo/front-core-lib';

/**
 * Table to list the users of an space
 */
@Component({
  selector: 'ca-space-user-table',
  templateUrl: './ca-space-user-table.component.html',
  styleUrls: ['./ca-space-user-table.component.scss']
})
export class CaSpaceUserTableComponent extends FlTableAbstractDirective<CaSpaceUser>
  implements OnInit {

  @Input() datasource: CaSpaceUserDatasource;

  @Output() removeUser: EventEmitter<CaSpaceUser> = new EventEmitter();

  @Output() activateUser: EventEmitter<CaSpaceUser> = new EventEmitter();

  @Output() deactivateUser: EventEmitter<CaSpaceUser> = new EventEmitter();

  @Output() updateRole: EventEmitter<CaSpaceUser> = new EventEmitter();

  constructor() {
    super(['user', 'role', 'active', 'actions']);
  }

  ngOnInit(): void {
  }

  onRemoveUser(user: CaSpaceUser): void {
    this.removeUser.emit(user);
  }

  onActivateUser(user: CaSpaceUser): void {
    this.activateUser.emit(user);
  }

  onDeactivateUser(user: CaSpaceUser): void {
    this.deactivateUser.emit(user);
  }

  onUpdateRole(user: CaSpaceUser): void {
    this.updateRole.emit(user);
  }

}
