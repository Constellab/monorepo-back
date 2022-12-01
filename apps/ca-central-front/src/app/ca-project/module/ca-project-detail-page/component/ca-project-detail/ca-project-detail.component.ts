import {Component, OnInit} from '@angular/core';
import {CaProject} from '../../../../../ca-core/model/entities/ca-project.class';
import {CaProjectService} from '../../../../../ca-core/service-api/ca-project.service';
import {FlDialogService} from '@monorepo/front-core-lib';
import {CaProjectDetailRightPanel, CaProjectDetailState} from '../../state/ca-project-detail.state';
import {Observable} from 'rxjs';
import {CaUser} from '../../../../../ca-core/model/entities/ca-user.class';
import {
  CaProjectSharedGroupsListComponent,
  CaProjectSharedGroupsListInput
} from '../ca-project-shared-groups-list/ca-project-shared-groups-list.component';
import {map} from 'rxjs/operators';
import {CaRouterService} from '../../../../../ca-core/service/ca-router.service';

/**
 * Show detailed information for a project , used in ProjectDetailPage
 */
@Component({
  selector: 'ca-project-detail',
  templateUrl: './ca-project-detail.component.html',
  styleUrls: ['./ca-project-detail.component.scss']
})
export class CaProjectDetailComponent implements OnInit {

  projectId$: Observable<string>;
  project$: Observable<CaProject>;
  projectUsers$: Observable<CaUser[]>;
  rightPanelState$: Observable<CaProjectDetailRightPanel>;

  isRootProject$: Observable<boolean>;

  commentQueryParams: CaProjectDetailRightPanel = {type: 'comments', objectId: null};
  descriptionQueryParams: CaProjectDetailRightPanel = {type: 'description', objectId: null};

  constructor(private dialogService: FlDialogService,
              private projectService: CaProjectService,
              private state: CaProjectDetailState,
              private routerService: CaRouterService) {
  }

  ngOnInit(): void {
    this.projectId$ = this.state.getProjectId$();
    this.project$ = this.state.getProject$();
    this.projectUsers$ = this.state.getUsers$();
    this.rightPanelState$ = this.state.getRightPanelState$();
    this.isRootProject$ = this.state.getProject$().pipe(
      map(project => project.isRoot())
    );
  }

  onProjectUpdated(project: CaProject): void {
    this.state.updateCurrentProject(project);
  }

  onProjectDeleted(project: CaProject): void {
    if(project.parentId != null){
      this.routerService.navigateToProjectDetail(project.parentId);
    }else{
      this.routerService.navigateToDashboard()
    }
  }
  onChildCreated(project: CaProject): void {
    this.state.addChild(project);
  }


  openShareDialog(project: CaProject): void {
    const input: CaProjectSharedGroupsListInput = {
      projectId: project.id,
      canEdit$: this.state.canEditProject$()
    };

    this.dialogService.openSmallDialog(CaProjectSharedGroupsListComponent, {data: input});
  }
}
