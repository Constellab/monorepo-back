import {Component, OnInit} from '@angular/core';
import {LabInstanceUser} from '../../../core/model/entities/lab-instance.class';
import {FlTableAbstractDirective} from '@monorepo/front-core-lib';

@Component({
  selector: 'gen-lab-instance-users-table',
  templateUrl: './lab-instance-users-table.component.html',
  styleUrls: ['./lab-instance-users-table.component.scss']
})
export class LabInstanceUsersTableComponent extends FlTableAbstractDirective<LabInstanceUser>
  implements OnInit {


  constructor() {
    super(['fullname', 'group', 'isActive']);
  }

  ngOnInit(): void {
  }

}
