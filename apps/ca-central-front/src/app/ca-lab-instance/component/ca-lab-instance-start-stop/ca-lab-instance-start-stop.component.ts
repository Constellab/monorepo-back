import {Component, OnInit} from '@angular/core';
import {CaLabInstance, CaLabInstanceStatusDTO} from '../../../ca-core/model/entities/lab/ca-lab-instance.class';
import {CaLabInstanceService} from '../../../ca-core/service-api/ca-lab-instance.service';
import {
  FlConfirmDialogInput,
  FlConfirmDialogResult,
  FlDialogService,
  FlSnackBarService
} from '@monorepo/front-core-lib';
import {CaLabInstanceDetailPageState} from '../../state/ca-lab-instance-detail-page.state';
import {Observable} from 'rxjs';
import {map} from 'rxjs/operators';

/**
 * Toggle button to start or stop the lab instance
 */
@Component({
  selector: 'ca-lab-instance-start-stop',
  templateUrl: './ca-lab-instance-start-stop.component.html',
  styleUrls: ['./ca-lab-instance-start-stop.component.scss']
})
export class CaLabInstanceStartStopComponent implements OnInit {

  status$: Observable<CaLabInstanceStatusDTO> = this.state.getStatus$();
  serverIsReady$: Observable<boolean> = this.state.getStatus$().pipe(
    map(status => status.hasServerInstanceId && status.labStatus.value != 'SERVER_STARTING' && status.labStatus.value != 'SERVER_STOPPING')
  );

  constructor(private state: CaLabInstanceDetailPageState,
              private labInstanceService: CaLabInstanceService,
              private snackBarService: FlSnackBarService,
              private dialogService: FlDialogService) {
  }

  ngOnInit(): void {
  }

  startLab(): void {
    const input: FlConfirmDialogInput = {
      title: 'start_lab',
      content: 'start_lab_confirm',
      translateTitleAndContent: true,
      observable: this.labInstanceService.startLabInstance(this.state.getLabInstanceId()),
    };

    this.dialogService.openConfirmDialog(input).afterClosed().subscribe(
      lab => this.onLabUpdate(lab)
    );
  }

  stopLab(): void {
    const input: FlConfirmDialogInput = {
      title: 'stop_lab',
      content: 'stop_lab_confirm',
      translateTitleAndContent: true,
      observable: this.labInstanceService.stopLabInstance(this.state.getLabInstanceId()),
    };

    this.dialogService.openConfirmDialog(input).afterClosed().subscribe(
      lab => this.onLabUpdate(lab)
    );
  }

  private onLabUpdate(result: FlConfirmDialogResult<CaLabInstance>): void {
    if (!result.choice) return;
    let successText: string;
    if (result.result.currentStatus.status.value === 'SERVER_STARTING') {
      successText = 'lab_is_starting';
    } else if (result.result.currentStatus.status.value === 'SERVER_STOPPING') {
      successText = 'lab_is_stopping';
    } else if (result.result.currentStatus.status.value === 'LAB_RUNNING') {
      successText = 'lab_started';
    } else {
      successText = 'lab_stopped';
    }

    this.snackBarService.openSuccessMessage({text: successText, translateText: true});
    this.state.updateLab(result.result);
  }
}
