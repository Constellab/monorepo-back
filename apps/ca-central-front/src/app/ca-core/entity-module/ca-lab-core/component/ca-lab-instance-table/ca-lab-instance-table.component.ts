import {Component, Input, OnInit} from '@angular/core';
import {CaLabInstance} from '../../../../model/entities/ca-lab-instance.class';
import {CaLabInstanceFormDialogComponent} from '../ca-lab-instance-form-dialog/ca-lab-instance-form-dialog.component';
import {
  FlArrayObs,
  FlConfirmDialogInput,
  FlConfirmDialogResult,
  FlDialogService,
  FlFormDialogInput,
  FlTableAbstractDirective
} from '@monorepo/front-core-lib';
import {CaRouterService} from '../../../../service/ca-router.service';
import {
  CaLabInstanceStatusDialogComponent
} from '../ca-lab-instance-status-dialog/ca-lab-instance-status-dialog.component';
import {CaLabInstanceService} from '../../../../service-api/ca-lab-instance.service';


@Component({
  selector: 'ca-lab-instance-table',
  templateUrl: './ca-lab-instance-table.component.html',
  styleUrls: ['./ca-lab-instance-table.component.scss']
})
export class CaLabInstanceTableComponent extends FlTableAbstractDirective<CaLabInstance> implements OnInit {

  @Input() datasource: FlArrayObs<CaLabInstance>;

  constructor(private dialogService: FlDialogService,
              private labInstanceService: CaLabInstanceService) {
    super(['name', 'owner', 'createdBy', 'currentStatus', 'serverInfo', 'createdBy', 'actions']);
  }

  ngOnInit(): void {
  }

  openUpdateDialog(labInstance: CaLabInstance): void {
    const dialogInput: FlFormDialogInput<CaLabInstance> = {
      mode: 'update', object: labInstance
    };

    this.dialogService.openSmallDialog(CaLabInstanceFormDialogComponent, {data: dialogInput}).afterClosed().subscribe(
      result => this.onUpdateClosed(result)
    );
  }

  private onUpdateClosed(labInstance?: CaLabInstance): void {
    if (labInstance) {
      this.datasource.updateItem(labInstance);
    }
  }

  getLabRoute(lab: CaLabInstance): string {
    return CaRouterService.getLabInstanceDetailRoute(lab.id);
  }

  openStatusDialog(labInstance: CaLabInstance): void {
    this.dialogService.openMediumDialog(CaLabInstanceStatusDialogComponent, {data: labInstance.id});
  }

  openDeleteDialog(labInstance: CaLabInstance): void {
    const input: FlConfirmDialogInput = {
      title: 'delete_lab_instance',
      content: 'delete_lab_instance_confirmation',
      translateTitleAndContent: true,
      observable: this.labInstanceService.delete(labInstance.id),
      successMessage: 'lab_instance_deleted',
      translateMessage: true
    };

    this.dialogService.openConfirmDialog(input).afterClosed().subscribe(
      result => this.onDeleteClosed(result, labInstance)
    );
  }

  private onDeleteClosed(result: FlConfirmDialogResult<void>, labInstance: CaLabInstance): void {
    if (result.choice) {
      this.datasource.removeItem(labInstance);
    }
  }

}
