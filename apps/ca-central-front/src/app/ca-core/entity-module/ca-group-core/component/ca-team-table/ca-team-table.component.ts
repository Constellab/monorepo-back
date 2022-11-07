import {Component, Input, OnInit} from '@angular/core';
import {FlTableAbstractDirective} from '@monorepo/front-core-lib';
import {CaGroup, CaGroupDatasource} from '../../../../model/entities/ca-group.entity';

@Component({
  selector: 'ca-team-table',
  templateUrl: './ca-team-table.component.html',
  styleUrls: ['./ca-team-table.component.scss']
})
export class CaTeamTableComponent extends FlTableAbstractDirective<CaGroup>
  implements OnInit {

  @Input() datasource: CaGroupDatasource;

  constructor() {
    super(['creation', 'actions']);
  }

  ngOnInit(): void {
  }

  onTeamDeleted(team: CaGroup): void {
    this.datasource.removeItem(team);
  }

}
