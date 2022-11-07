import {Component, OnInit} from '@angular/core';
import {FlTableColumn} from '@monorepo/front-core-lib';
import {CaProject, CaProjectDatasource} from '../../../../ca-core/model/entities/ca-project.class';
import {CaProjectService} from '../../../../ca-core/service-api/ca-project.service';

/**
 * Component for organization admin to list all the projects of the organization
 */
@Component({
  selector: 'ca-current-orga-projects-list',
  templateUrl: './ca-current-orga-projects-list.component.html',
  styleUrls: ['./ca-current-orga-projects-list.component.scss']
})
export class CaCurrentOrgaProjectsListComponent implements OnInit {

  projects: CaProjectDatasource;

  columns: FlTableColumn<CaProject>[] = ['title', 'status', 'leader', 'creation', 'actions'];

  constructor(private projectService: CaProjectService) {
  }

  ngOnInit(): void {
    this.projects = this.projectService.getProjectByCurrentOrganizationDatasource();
  }

}
