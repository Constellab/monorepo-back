import {Component, OnInit} from '@angular/core';
import {FlTableAbstractDirective} from '@monorepo/front-core-lib';
import {CaProject} from '../../../../model/entities/ca-project.class';

@Component({
  selector: 'ca-project-table',
  templateUrl: './ca-project-table.component.html',
  styleUrls: ['./ca-project-table.component.scss']
})
export class CaProjectTableComponent extends FlTableAbstractDirective<CaProject> implements OnInit {

  constructor() {
    super(['title', 'createdBy', 'status', 'leader'])
  }

  ngOnInit(): void {
  }

}
