import {Component, OnInit} from '@angular/core';
import {FlTableColumn} from '@monorepo/front-core-lib';
import {CaProject, CaProjectDatasource} from '../../../../ca-core/model/entities/ca-project.class';
import {CaProjectService} from '../../../../ca-core/service-api/ca-project.service';
import {CaCurrentSpaceDetailComponent} from '../ca-current-space-detail/ca-current-space-detail.component';

/**
 * Component for space admin to list all the projects of the space
 */
@Component({
  selector: 'ca-current-space-projects-list',
  templateUrl: './ca-current-space-projects-list.component.html',
  styleUrls: ['./ca-current-space-projects-list.component.scss']
})
export class CaCurrentSpaceProjectsListComponent implements OnInit {

  projects: CaProjectDatasource;

  columns: FlTableColumn<CaProject>[] = ['title', 'status', 'leader', 'creation', 'actions'];

  constructor(private projectService: CaProjectService) {
  }

  ngOnInit(): void {
    this.projects = this.projectService.getProjectByCurrentSpaceDatasource();
  }

}
