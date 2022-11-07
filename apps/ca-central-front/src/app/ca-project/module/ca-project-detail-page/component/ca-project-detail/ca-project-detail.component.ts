import {Component, OnInit} from '@angular/core';
import {CaProject} from '../../../../../ca-core/model/entities/ca-project.class';
import {CaProjectService} from '../../../../../ca-core/service-api/ca-project.service';
import {FlDialogService} from '@monorepo/front-core-lib';
import {CaProjectDetailState} from '../../state/ca-project-detail.state';
import {Observable} from 'rxjs';
import {CaUser} from '../../../../../ca-core/model/entities/ca-user.class';

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

  constructor(private dialogService: FlDialogService,
              private projectService: CaProjectService,
              private state: CaProjectDetailState) {
  }

  ngOnInit(): void {
    this.projectId$ = this.state.getProjectId$();
    this.project$ = this.state.getProject$();
    this.projectUsers$ = this.state.getUsers$();
  }

  onProjectUpdated(project: CaProject): void {
    this.state.updateCurrentProject(project);
  }

  onChildCreated(project: CaProject): void {
    this.state.addChild(project);
  }


  showComments(): void {
    this.state.updateRightPanelState({type: 'comments'});
  }

  showDescription(): void {
    this.state.updateRightPanelState({type: 'description'});
  }
}
