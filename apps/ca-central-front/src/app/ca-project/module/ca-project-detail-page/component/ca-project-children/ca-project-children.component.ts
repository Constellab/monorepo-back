import {Component, OnDestroy, OnInit} from '@angular/core';
import {Observable} from 'rxjs';
import {CaProject} from '../../../../../ca-core/model/entities/ca-project.class';
import {CaProjectDetailState} from '../../state/ca-project-detail.state';
import {
  CaProjectFormDialogComponent,
  CaProjectFormDialogInput
} from '../../../../../ca-core/entity-module/ca-project-core/component/ca-project-form-dialog/ca-project-form-dialog.component';
import {FlDialogService} from '@monorepo/front-core-lib';

@Component({
  selector: 'ca-project-children',
  templateUrl: './ca-project-children.component.html',
  styleUrls: ['./ca-project-children.component.scss']
})
export class CaProjectChildrenComponent implements OnInit, OnDestroy {


  children$: Observable<CaProject[]>;


  constructor(private state: CaProjectDetailState,
              private dialogService: FlDialogService) {

  }

  ngOnInit(): void {
    this.children$ = this.state.getChildren$().connect();
  }

  ngOnDestroy(): void {
  }

  openChildCreation(): void {
    const project = this.state.getCurrentProject();
    const dialogInput: CaProjectFormDialogInput = {
      mode: 'create',
      level: project.getChildLevel(),
      parentId: project.id,
      parentLevel: project.currentLevel,
    };

    this.dialogService.openSmallDialog(CaProjectFormDialogComponent, {
      data: dialogInput
    }).afterClosed().subscribe(
      project => this.createChildSuccess(project)
    );
  }

  private createChildSuccess(project?: CaProject): void {
    if (project) {
      this.state.addChild(project);
    }
  }


}
