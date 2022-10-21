import {Component, OnInit} from '@angular/core';
import {CaProject, CaProjectStatus, caProjectStatusDict} from '../../../../../ca-core/model/entities/ca-project.class';
import {
  CaProjectFormDialogComponent,
  CaProjectFormDialogInput
} from '../../../../../ca-core/entity-module/ca-project-core/component/ca-project-form-dialog/ca-project-form-dialog.component';
import {
  CaUpdateStatusFormDialogComponent,
  UpdateStatusFormDialogInput
} from '../../../../../ca-core/module/ca-status/ca-update-status-form-dialog/ca-update-status-form-dialog.component';
import {CaProjectService} from '../../../../../ca-core/service-api/ca-project.service';
import {
  CaStatusHistoryListDialogComponent,
  CaStatusHistoryListDialogInput
} from '../../../../../ca-core/module/ca-status/ca-status-history-list-dialog/ca-status-history-list-dialog.component';
import {FlDialogService} from '@monorepo/front-core-lib';
import {CaProjectDetailState} from '../../state/ca-project-detail.state';
import {Observable} from 'rxjs';
import {
  CaUpdateProjectLeaderDialogComponent,
  CaUpdateProjectLeaderDialogInput
} from '../../../../../ca-core/entity-module/ca-project-core/component/ca-update-project-leader-dialog/ca-update-project-leader-dialog.component';

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

  constructor(private dialogService: FlDialogService,
              private projectService: CaProjectService,
              private state: CaProjectDetailState) {
  }

  ngOnInit(): void {
    this.projectId$ = this.state.getProjectId$();
    this.project$ = this.state.getProject$();
  }

  openUpdateProjectDialog(project: CaProject): void {
    const dialogInput: CaProjectFormDialogInput = {
      mode: 'update',
      object: project,
      level: project.currentLevel,
      parentId: null,
    };

    this.dialogService.openSmallDialog(CaProjectFormDialogComponent, {
      data: dialogInput
    }).afterClosed().subscribe(
      project => this.updateDialogClosed(project)
    );
  }

  openUpdateStatusDialog(project: CaProject): void {
    const dialogInput: UpdateStatusFormDialogInput<CaProjectStatus> = {
      statusDict: caProjectStatusDict,
      currentStatus: project.currentStatus.status,
      updateStatus: this.projectService.getUpdateStatusMethod(project.id),
      title: 'update_project_status'
    };
    this.dialogService.openSmallDialog(CaUpdateStatusFormDialogComponent, {data: dialogInput}).afterClosed().subscribe(
      newExp => this.updateDialogClosed(newExp)
    );
  }

  private updateDialogClosed(project?: CaProject): void {
    if (project) {
      this.state.updateCurrentProject(project);
    }
  }

  openChildCreation(project: CaProject): void {
    const dialogInput: CaProjectFormDialogInput = {
      mode: 'create',
      level: project.getChildLevel(),
      parentId: project.id
    };

    this.dialogService.openSmallDialog(CaProjectFormDialogComponent, {
      data: dialogInput
    }).afterClosed().subscribe(
      project => this.createChildSuccess(project)
    );
  }

  private createChildSuccess(project: CaProject): void {
    this.state.addChild(project);
  }

  openStatusHistory(project: CaProject): void {
    const dialogInput: CaStatusHistoryListDialogInput = {
      statusHistoriesObs: this.projectService.getStatusHistories(project.id),
    };
    this.dialogService.openSmallDialog(CaStatusHistoryListDialogComponent, {data: dialogInput});
  }

  showDescription(): void {
    this.state.updateRightPanelState({type: 'description'});
  }

  openUpdateProjectLeaderDialog(project: CaProject): void {
    const dialogInput: CaUpdateProjectLeaderDialogInput = {
      projectId: project.id,
      currentLeader: project.leader,
      users$: this.state.getUsers$()
    };

    this.dialogService.openSmallDialog(CaUpdateProjectLeaderDialogComponent, {
      data: dialogInput
    }).afterClosed().subscribe(
      leader => project.leader = leader
    );
  }
}
