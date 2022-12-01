import {Component, Input, OnInit} from '@angular/core';
import {FlTableAbstractDirective} from '@monorepo/front-core-lib';
import {CaProject, CaProjectDatasource} from '../../../../model/entities/ca-project.class';
import {CaRouterService} from '../../../../service/ca-router.service';

@Component({
  selector: 'ca-project-table',
  templateUrl: './ca-project-table.component.html',
  styleUrls: ['./ca-project-table.component.scss']
})
export class CaProjectTableComponent extends FlTableAbstractDirective<CaProject> implements OnInit {

  @Input() datasource: CaProjectDatasource;

  constructor(private routerService: CaRouterService) {
    super(['title', 'creation', 'status', 'leader', 'actions']);
  }

  ngOnInit(): void {
  }

  onProjectUpdated(project: CaProject): void {
    this.datasource.updateItem(project);
  }

  onProjectDeleted(project: CaProject): void {
    this.datasource.removeItem(project);
  }

  onChildCreated(project: CaProject): void {
    this.routerService.navigateToProjectDetail(project.id);
  }

}
