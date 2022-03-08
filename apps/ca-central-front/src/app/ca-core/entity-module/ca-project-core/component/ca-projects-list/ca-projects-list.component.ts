import {Component, Input, OnInit} from '@angular/core';
import {CaProject} from '../../../../model/entities/ca-project.class';
import {CaRouterService} from '../../../../service/ca-router.service';

/**
 * List of the current user projects
 */
@Component({
  selector: 'ca-projects-list',
  templateUrl: './ca-projects-list.component.html',
  styleUrls: ['./ca-projects-list.component.scss']
})
export class CaProjectsListComponent implements OnInit {

  @Input() projects: CaProject[];

  constructor() {
  }

  ngOnInit(): void {
  }

  getProjectRoute(project: CaProject): string {
    return CaRouterService.getProjectDetailRoute(project.id);
  }

}
