import {Component, Input, OnInit} from '@angular/core';
import {CaLabInstance} from '../../../../model/entities/ca-lab-instance.class';
import {CaLabInstanceFormDialogComponent} from '../ca-lab-instance-form-dialog/ca-lab-instance-form-dialog.component';
import {FlArrayObs, FlDialogService, FlFormDialogInput, FlTableAbstractDirective} from '@monorepo/front-core-lib';
import {CaRouterService} from '../../../../service/ca-router.service';
import {
  CaLabInstanceStatusDialogComponent
} from '../ca-lab-instance-status-dialog/ca-lab-instance-status-dialog.component';


@Component({
  selector: 'ca-lab-instance-table',
  templateUrl: './ca-lab-instance-table.component.html',
  styleUrls: ['./ca-lab-instance-table.component.scss']
})
export class CaLabInstanceTableComponent extends FlTableAbstractDirective<CaLabInstance> implements OnInit {

  @Input() datasource: FlArrayObs<CaLabInstance>;

  constructor(private dialogService: FlDialogService) {
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


}
