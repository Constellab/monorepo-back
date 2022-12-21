import {Component, OnInit} from '@angular/core';
import {FlTableAbstractDirective} from '@monorepo/front-core-lib';
import {LabSharedEntity} from '../../../../model/entities/lab-share.entity';

@Component({
  selector: 'lab-shared-entity-table',
  templateUrl: './lab-shared-entity-table.component.html',
  styleUrls: ['./lab-shared-entity-table.component.scss']
})
export class LabSharedEntityTableComponent extends FlTableAbstractDirective<LabSharedEntity>
  implements OnInit {

  constructor() {
    super(['lab', 'space', 'receiver', 'sharedBy'])
  }

  ngOnInit(): void {
  }

}
