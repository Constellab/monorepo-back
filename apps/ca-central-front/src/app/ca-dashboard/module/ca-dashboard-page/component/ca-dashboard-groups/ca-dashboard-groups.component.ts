import {Component, OnInit} from '@angular/core';
import {CaGroupDatasourcePaginated} from '../../../../../ca-core/model/entities/ca-group.entity';
import {CaRouterService} from '../../../../../ca-core/service/ca-router.service';
import {CaGroupService} from '../../../../../ca-core/service-api/ca-group.service';

/**
 * Small list of groups in the dashboard
 */
@Component({
  selector: 'ca-dashboard-groups',
  templateUrl: './ca-dashboard-groups.component.html',
  styleUrls: ['./ca-dashboard-groups.component.scss']
})
export class CaDashboardGroupsComponent implements OnInit {

  groupDatasource: CaGroupDatasourcePaginated;

  myGroupsRoute: string = CaRouterService.getMyTeamsRoute();

  constructor(private groupService: CaGroupService) {
  }

  ngOnInit(): void {
    this.groupDatasource = this.groupService.getMyTeamsDatasource(4);
  }

}
