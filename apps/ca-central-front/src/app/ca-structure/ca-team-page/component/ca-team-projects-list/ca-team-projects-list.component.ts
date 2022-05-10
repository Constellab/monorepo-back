import {Component, Input, OnInit} from '@angular/core';
import {CaProjectService} from '../../../../ca-core/service-api/ca-project.service';
import {CaProjectDatasource} from '../../../../ca-core/model/entities/ca-project.class';

/**
 * Component to list the projects of a group
 */
@Component({
  selector: 'ca-group-projects-list',
  templateUrl: './ca-team-projects-list.component.html',
  styleUrls: ['./ca-team-projects-list.component.scss']
})
export class CaTeamProjectsListComponent implements OnInit {

  @Input() teamId: string;

  projectsDatasource: CaProjectDatasource;

  constructor(private projectService: CaProjectService) {
  }

  ngOnInit(): void {
    this.projectsDatasource = this.projectService.getProjectsByTeamDatasource(this.teamId);
  }

}
