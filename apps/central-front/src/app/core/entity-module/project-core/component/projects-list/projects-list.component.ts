import {Component, Input, OnInit} from '@angular/core';
import {Project} from '../../../../model/entities/project.class';
import {RouterService} from '../../../../service/router.service';

/**
 * List of the current user projects
 */
@Component({
  selector: 'gen-projects-list',
  templateUrl: './projects-list.component.html',
  styleUrls: ['./projects-list.component.scss']
})
export class ProjectsListComponent implements OnInit {

  @Input() projects: Project[];

  constructor() {
  }

  ngOnInit(): void {
  }

  getProjectRoute(project: Project): string {
    return RouterService.getProjectDetailRoute(project.id);
  }

}
