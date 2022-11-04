import {Component, Input, OnInit} from '@angular/core';
import {FlDialogService, FlTableColumn} from '@monorepo/front-core-lib';
import {CaLabInstanceService} from '../../../ca-core/service-api/ca-lab-instance.service';
import {
  CaLabInstanceProject,
  CaLabInstanceProjectDatasource
} from '../../../ca-core/model/entities/ca-lab-instance-project.class';
import {
  CaLabInstanceAddProjectDialogComponent,
  CaLabInstanceAddProjectDialogInput
} from '../ca-lab-instance-add-project-dialog/ca-lab-instance-add-project-dialog.component';

@Component({
  selector: 'ca-lab-instance-projects-list',
  templateUrl: './ca-lab-instance-projects-list.component.html',
  styleUrls: ['./ca-lab-instance-projects-list.component.scss']
})
export class CaLabInstanceProjectsListComponent implements OnInit {

  @Input() labInstanceId: string;

  column: FlTableColumn<CaLabInstanceProject>[] = ['project', 'createdBy', 'createdAt', 'actions'];

  datasource: CaLabInstanceProjectDatasource;

  constructor(private labInstanceService: CaLabInstanceService,
              private dialogService: FlDialogService) {
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
