import {Component, OnDestroy, OnInit} from '@angular/core';
import {CaLabInstanceDetailPageState} from '../../state/ca-lab-instance-detail-page.state';
import {Observable, Subscription} from 'rxjs';
import {CaLabInstanceStatusDTO} from '../../../ca-core/model/entities/lab/ca-lab-instance.class';
import {
  FlConfirmDialogInput,
  FlConfirmDialogResult,
  FlDialogService,
  FlPortalActionsService
} from '@monorepo/front-core-lib';
import {
  CaLabServerCompleteInfoDialogComponent
} from '../ca-lab-server-complete-info-dialog/ca-lab-server-complete-info-dialog.component';
import {CaLabInstanceService} from '../../../ca-core/service-api/ca-lab-instance.service';
import {map} from 'rxjs/operators';

interface CaCurrentStatusAction {
  message: string;
  actionText?: string;
  action?: () => void;
}

@Component({
  selector: 'ca-lab-instance-server',
  templateUrl: './ca-lab-instance-server.component.html',
  styleUrls: ['./ca-lab-instance-server.component.scss']
})
export class CaLabInstanceServerComponent implements OnInit, OnDestroy {

  status$: Observable<CaLabInstanceStatusDTO> = this.state.getStatus$();
  isOwner$: Observable<boolean> = this.state.isLabOwner$();

  statusAction$: Observable<CaCurrentStatusAction>;

  private actionType: string = 'ca-lab-instance-server';
  private subscription: Subscription;

  constructor(private state: CaLabInstanceDetailPageState,
              private dialogService: FlDialogService,
              private portalService: FlPortalActionsService,
              private labInstanceService: CaLabInstanceService) {
  }

  ngOnInit(): void {
    this.subscription = this.portalService.getResult$(this.actionType).subscribe(
      (result) => this.refreshStateStatus(result.result)
    );

    this.statusAction$ = this.status$.pipe(map(status => this.convertStatusMessage(status)));
  }

  private convertStatusMessage(status: CaLabInstanceStatusDTO): CaCurrentStatusAction {
    if (!status.hasServerInstanceId || !status.hasServerVolumeId) {
      return {
        message: 'lab_status_server_not_created',
        actionText: 'lab_init_server',
        action: () => this.initServer()
      };
    } else if (!status.labManagerIsRunning) {
      return {
        message: 'lab_status_server_lab_manager_not_available',
        actionText: 'lab_configure_lab',
        action: () => this.configureLab()
      };
    } else if (!status.labIsRunning) {
      return {
        message: 'lab_status_server_lab_not_available',
      };
    } else {
      return {
        message: 'lab_status_lab_running',
      };
    }
  }

  openServerInfoDialog(): void {
    this.dialogService.openMediumDialog(CaLabServerCompleteInfoDialogComponent,
      {data: this.state.getLabInstanceId()});
  }

  initServer(): void {
    this.portalService.addAction({
      type: this.actionType,
      text: {text: 'lab_init_server', translateText: true},
      action: this.labInstanceService.initServer(this.state.getLabInstanceId())
    });
  }

  configureServer(): void {
    this.portalService.addAction({
      type: this.actionType,
      text: {text: 'lab_configure_server', translateText: true},
      action: this.labInstanceService.configureServer(this.state.getLabInstanceId())
    });
  }

  configureLab(): void {
    this.portalService.addAction({
      type: this.actionType,
      text: {text: 'lab_configure_lab', translateText: true},
      action: this.labInstanceService.configureLab(this.state.getLabInstanceId())
    });
  }

  forceStatusRefresh(): void {
    this.portalService.addAction({
      type: this.actionType,
      text: {text: 'refresh_status', translateText: true},
      action: this.labInstanceService.refreshStatus(this.state.getLabInstanceId())
    });
  }

  deleteServer(): void {
    const input: FlConfirmDialogInput = {
      title: 'lab_delete_server',
      content: 'lab_delete_server_confirmation',
      translateTitleAndContent: true,
      observable: this.labInstanceService.deleteServer(this.state.getLabInstanceId()),
      successMessage: 'lab_server_deleted',
      translateMessage: true
    };

    this.dialogService.openConfirmDialog(input).afterClosed().subscribe(
      (result: FlConfirmDialogResult) => this.onDeleteClosed(result)
    );
  }

  private onDeleteClosed(result: FlConfirmDialogResult): void {
    if (result.choice) {
      this.refreshStateStatus();
    }
  }

  private refreshStateStatus(object?: any): void {
    // if the response is a status, don't request it and directly update the state
    if (object && object instanceof CaLabInstanceStatusDTO) {
      this.state.setStatus(object);
    } else {
      // otherwise, request the status
      this.state.refreshStatus();
    }
  }

  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
  }


}
