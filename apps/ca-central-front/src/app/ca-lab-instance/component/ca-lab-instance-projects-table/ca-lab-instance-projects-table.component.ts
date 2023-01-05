import {Component, Input, OnInit} from '@angular/core';
import {
  CaLabInstanceProject,
  CaLabInstanceProjectDatasource
} from '../../../ca-core/model/entities/lab/ca-lab-instance-project.class';
import {
  FlConfirmDialogInput,
  FlConfirmDialogResult,
  FlDialogService,
  FlTableAbstractDirective
} from '@monorepo/front-core-lib';
import {CaLabInstanceService} from '../../../ca-core/service-api/ca-lab-instance.service';

@Component({
  selector: 'ca-lab-instance-projects-table',
  templateUrl: './ca-lab-instance-projects-table.component.html',
  styleUrls: ['./ca-lab-instance-projects-table.component.scss']
})
export class CaLabInstanceProjectsTableComponent extends FlTableAbstractDirective<CaLabInstanceProject>
  implements OnInit {

  @Input() datasource: CaLabInstanceProjectDatasource;

  @Input() labInstanceId: string;

  constructor(private labInstanceService: CaLabInstanceService,
              private dialogService: FlDialogService) {
    super(['project', 'createdBy', 'createdAt', 'actions']);
  }

  ngOnInit(): void {
  }

  openDeleteProjectDialog(labProject: CaLabInstanceProject): void {
    const data: FlConfirmDialogInput = {
      title: 'lab_remove_project',
      content: 'lab_remove_project_confirmation',
      translateTitleAndContent: true,
      observable: this.labInstanceService.removeProjectFromLab(this.labInstanceId, labProject.project.id),
      successMessage: 'lab_project_removed',
      translateMessage: true
    };

    this.dialogService.openConfirmDialog(data).afterClosed().subscribe(
      (result: FlConfirmDialogResult<void>) => this.onDeleteUserClosed(result, labProject)
    );
  }

  private onDeleteUserClosed(result: FlConfirmDialogResult<void>, labProject: CaLabInstanceProject): void {
    if (result.choice) {
      this.datasource.removeItem(labProject);
    }
  }
}
