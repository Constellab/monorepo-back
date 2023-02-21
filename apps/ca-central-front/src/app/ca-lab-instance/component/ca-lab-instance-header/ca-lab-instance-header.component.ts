import {Component, OnInit} from '@angular/core';
import {CaLabInstance, CaLabInstanceStatus} from '../../../ca-core/model/entities/lab/ca-lab-instance.class';
import {
  CaStatusHistoryListDialogComponent,
  CaStatusHistoryListDialogInput
} from '../../../ca-core/module/ca-status/ca-status-history-list-dialog/ca-status-history-list-dialog.component';
import {
  CaLabInstanceUpdateDialogComponent,
  LabInstanceUpdateDialogInput
} from '../ca-lab-instance-update-dialog/ca-lab-instance-update-dialog.component';
import {FlDialogService, FlStatus} from '@monorepo/front-core-lib';
import {CaLabInstanceService} from '../../../ca-core/service-api/ca-lab-instance.service';
import {CaLabInstanceDetailPageState} from '../../state/ca-lab-instance-detail-page.state';
import {Observable} from 'rxjs';
import {map} from 'rxjs/operators';
import {CaRouterService} from '../../../ca-core/service/ca-router.service';

/**
 * Header info about the lab instance in the detail page
 */
@Component({
  selector: 'ca-lab-instance-header',
  templateUrl: './ca-lab-instance-header.component.html',
  styleUrls: ['./ca-lab-instance-header.component.scss']
})
export class CaLabInstanceHeaderComponent implements OnInit {

  labInstance$: Observable<CaLabInstance> = this.state.getLabInstance$();
  labStatus$: Observable<FlStatus<CaLabInstanceStatus>> = this.state.getStatus$().pipe(
    map(status => status.labStatus)
  );

  constructor(private dialogService: FlDialogService,
              private labInstanceService: CaLabInstanceService,
              private state: CaLabInstanceDetailPageState) {
  }

  ngOnInit(): void {
  }

  openStatusHistoryDialog(labInstance: CaLabInstance): void {
    const dialogInput: CaStatusHistoryListDialogInput = {
      statusHistoriesObs: this.labInstanceService.getStatusHistories(labInstance.id),
    };
    this.dialogService.openSmallDialog(CaStatusHistoryListDialogComponent, {data: dialogInput});
  }

  openLabUpdate(labInstance: CaLabInstance): void {
    const input: LabInstanceUpdateDialogInput = {
      id: labInstance.id,
      name: labInstance.name,
      onPremisePlatform: labInstance.onPremisePlatform
    };
    this.dialogService.openSmallDialog(CaLabInstanceUpdateDialogComponent, {data: input}).afterClosed().subscribe(
      labInstance => this.onUpdateClosed(labInstance)
    );
  }

  private onUpdateClosed(labInstance?: CaLabInstance): void {
    if (labInstance) {
      this.state.updateLab(labInstance);
    }
  }

  getDetailRoute(labInstance: CaLabInstance): string {
    return CaRouterService.getLabInstanceDetailRoute(labInstance.id);
  }

  getConfigRoute(labInstance: CaLabInstance): string {
    return CaRouterService.getLabInstanceConfigRoute(labInstance.id);
  }

}
