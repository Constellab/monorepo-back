import {Component, OnInit} from '@angular/core';
import {mergeMap, Observable} from 'rxjs';
import {ActivatedRoute} from '@angular/router';
import {CaGroupService} from '../../../../ca-core/service-api/ca-group.service';
import {CaGroup} from '../../../../ca-core/model/entities/ca-group.entity';

/**
 * Page to show the detail of a team
 */
@Component({
  selector: 'ca-team-page',
  templateUrl: './ca-team-page.component.html',
  styleUrls: ['./ca-team-page.component.scss']
})
export class CaTeamPageComponent implements OnInit {

  teams$: Observable<CaGroup>;

  constructor(private route: ActivatedRoute,
              private groupService: CaGroupService) {
  }

  ngOnInit(): void {
    this.teams$ = this.route.params.pipe(
      mergeMap(params => this.groupService.getTeamById(params.id))
    );
  }

}
