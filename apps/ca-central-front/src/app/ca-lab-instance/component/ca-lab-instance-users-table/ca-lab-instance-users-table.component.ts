import {Component, OnInit} from '@angular/core';
import {CaLabInstanceUser} from '../../../ca-core/model/entities/ca-lab-instance.class';
import {FlTableAbstractDirective} from '@monorepo/front-core-lib';

@Component({
  selector: 'ca-lab-instance-users-table',
  templateUrl: './ca-lab-instance-users-table.component.html',
  styleUrls: ['./ca-lab-instance-users-table.component.scss']
})
export class CaLabInstanceUsersTableComponent extends FlTableAbstractDirective<CaLabInstanceUser>
  implements OnInit {


  constructor() {
    super(['fullname', 'group', 'isActive']);
  }

  ngOnInit(): void {
  }

}
