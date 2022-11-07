import {Component, Input, OnInit} from '@angular/core';
import {CaGroup} from '../../../../ca-core/model/entities/ca-group.entity';
import {CaRouterService} from '../../../../ca-core/service/ca-router.service';

/**
 * Show detail of a team
 */
@Component({
  selector: 'ca-team-detail',
  templateUrl: './ca-team-detail.component.html',
  styleUrls: ['./ca-team-detail.component.scss']
})
export class CaTeamDetailComponent implements OnInit {

  @Input() team: CaGroup;

  constructor(private routerService: CaRouterService) {
  }

  ngOnInit(): void {
  }


  onTeamDeleted(): void {
    this.routerService.navigateToMyTeams();
  }

}
