import {Component, Input, OnInit} from '@angular/core';
import {FlDialogService, FlTableColumn} from '@monorepo/front-core-lib';
import {CaLabInstanceService} from '../../../ca-core/service-api/ca-lab-instance.service';
import {
  CaLabInstanceProject,
  CaLabInstanceProjectDatasource
} from '../../../ca-core/model/entities/lab/ca-lab-instance-project.class';
import {
  CaLabInstanceAddProjectDialogComponent,
  CaLabInstanceAddProjectDialogInput
} from '../ca-lab-instance-add-project-dialog/ca-lab-instance-add-project-dialog.component';
import {CaLabInstanceDetailPageState} from '../../state/ca-lab-instance-detail-page.state';
import {Observable} from 'rxjs';
import {map} from 'rxjs/operators';

@Component({
  selector: 'ca-lab-instance-projects-list',
  templateUrl: './ca-lab-instance-projects-list.component.html',
  styleUrls: ['./ca-lab-instance-projects-list.component.scss']
})
export class CaLabInstanceProjectsListComponent implements OnInit {

  @Input() labInstanceId: string;

  columns$: Observable<FlTableColumn<CaLabInstanceProject>[]> = this.state.isLabOwner$().pipe(
    map(isLabOwner => {
      const columns = ['project', 'createdBy', 'createdAt'];
      // set the action column only if the user is the lab owner
      if (isLabOwner) {
        columns.push('actions');
      }
      return columns;
    }));

  datasource: CaLabInstanceProjectDatasource;

  isOwner$: Observable<boolean> = this.state.isLabOwner$();

  constructor(private labInstanceService: CaLabInstanceService,
              private dialogService: FlDialogService,
              private state: CaLabInstanceDetailPageState) {
  }

  ngOnInit(): void {
    this.datasource = new CaLabInstanceProjectDatasource(
      this.labInstanceService.getLabInstanceProjects(this.labInstanceId)
    );
  }

  openAddProjectDialog(): void {
    const data: CaLabInstanceAddProjectDialogInput = {
      labInstanceId: this.labInstanceId
    };

    this.dialogService.openMediumDialog(CaLabInstanceAddProjectDialogComponent,
      {data: data, panelClass: 'g-dialog-main-background'})
      .afterClosed().subscribe((labProject: CaLabInstanceProject) => this.onProjectAddedClosed(labProject));
  }

  private onProjectAddedClosed(labProject?: CaLabInstanceProject): void {
    if (labProject) {
      this.datasource.addItem(labProject);
    }
  }
}
