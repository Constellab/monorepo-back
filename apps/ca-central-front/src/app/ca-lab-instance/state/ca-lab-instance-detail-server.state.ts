import {Injectable} from '@angular/core';
import {CaLabInstanceService} from '../../ca-core/service-api/ca-lab-instance.service';
import {
  CaLabServerCompleteInfoDialogComponent
} from '../component/ca-lab-server-complete-info-dialog/ca-lab-server-complete-info-dialog.component';
import {CaLabInstanceDetailPageState} from './ca-lab-instance-detail-page.state';
import {
  FlConfirmDialogInput,
  FlConfirmDialogResult,
  FlDialogService,
  FlPortalActionsService
} from '@monorepo/front-core-lib';
import {Observable} from 'rxjs';
import {
  CaLabManagerUpdateDialogComponent,
  CaLabManagerUpdateDialogInput
} from '../component/ca-lab-manager-update-dialog/ca-lab-manager-update-dialog.component';

/**
 * State in the lab instance detail page to manage the server status.
 */
@Injectable()
export class CaLabInstanceDetailServerState {


  constructor(private state: CaLabInstanceDetailPageState,
              private labInstanceService: CaLabInstanceService,
              private dialogService: FlDialogService,
              private portalService: FlPortalActionsService) {
  }

  openServerInfoDialog(): void {
    this.dialogService.openMediumDialog(CaLabServerCompleteInfoDialogComponent,
      {data: this.state.getLabInstanceId()});
  }

  initServer(): void {
    const input: FlConfirmDialogInput = {
      title: 'lab_init_server',
      content: 'lab_init_server_confirmation',
      translateTitleAndContent: true,
    };

    this.openDialog(input, this.labInstanceService.initServer(this.state.getLabInstanceId()));
  }

  createServer(): void {
    const input: FlConfirmDialogInput = {
      title: 'lab_create_server',
      content: 'lab_create_server_confirmation',
      translateTitleAndContent: true,
    };

    this.openDialog(input, this.labInstanceService.createServer(this.state.getLabInstanceId()));
  }

  configureServer(): void {
    const input: FlConfirmDialogInput = {
      title: 'lab_configure_server',
      content: 'lab_configure_server_confirmation',
      translateTitleAndContent: true,
    };

    this.openDialog(input, this.labInstanceService.configureServer(this.state.getLabInstanceId()));
  }

  refreshStatus(): void {
    this.portalService.addAction({
      type: CaLabInstanceDetailPageState.actionType,
      text: {text: 'refresh_status', translateText: true},
      action: this.labInstanceService.refreshStatus(this.state.getLabInstanceId())
    });
  }

  updateLabManager(currentVersion: string, recommendedVersion: string): void {
    const input: CaLabManagerUpdateDialogInput = {
      labInstanceId: this.state.getLabInstanceId(),
      labManagerCurrentVersion: currentVersion,
      labManagerRecommendedVersion: recommendedVersion
    };

    this.dialogService.openSmallDialog(CaLabManagerUpdateDialogComponent, {data: input}).afterClosed().subscribe(
      (result: Observable<any>) => {
        if (result) {
          this.addPortalAction('lab_update_lab_manager', result);
        }
      }
    );

  }

  updateDockerlabRepo(): void {
    const input: FlConfirmDialogInput = {
      title: 'lab_update_dockerlab_repo',
      content: 'lab_update_dockerlab_repo_confirmation',
      translateTitleAndContent: true,
    };

    this.openDialog(input, this.labInstanceService.updateDockerlabRepository(this.state.getLabInstanceId()));
  }

  deleteServer(): void {
    const input: FlConfirmDialogInput = {
      title: 'lab_delete_server',
      content: 'lab_delete_server_confirmation',
      translateTitleAndContent: true,
    };

    this.openDialog(input, this.labInstanceService.deleteServer(this.state.getLabInstanceId()));
  }

  private openDialog(input: FlConfirmDialogInput, action: Observable<any>): void {
    this.dialogService.openConfirmDialog(input).afterClosed().subscribe(
      (result: FlConfirmDialogResult) => this.onDialogClosed(result, input.title, action)
    );
  }

  private onDialogClosed(result: FlConfirmDialogResult, text: string, action: Observable<any>): void {
    if (result.choice) {
      this.addPortalAction(text, action);
    }
  }

  private addPortalAction(text: string, action: Observable<any>): void {
    this.portalService.addAction({
      type: CaLabInstanceDetailPageState.actionType,
      text: {text: text, translateText: true},
      action: action
    });
  }


}
