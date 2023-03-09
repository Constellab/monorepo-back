import {Component, OnDestroy, OnInit} from '@angular/core';
import {CaLabInstanceService} from '../../../ca-core/service-api/ca-lab-instance.service';
import {distinct, Observable, share, throwError} from 'rxjs';
import {CaLabComposeUpOptions, CaLabManagerStatus} from '../../../ca-core/model/entities/lab/ca-lab-manager.class';
import {FlDialogService, FlPortalActionsService} from '@monorepo/front-core-lib';
import {
  CaLabInstanceDockerUpFormComponent,
  CaLabInstanceDockerUpFormInput
} from '../ca-lab-instance-docker-up-form/ca-lab-instance-docker-up-form.component';
import {
  CaLabInstanceStatusDialogComponent
} from '../../../ca-core/entity-module/ca-lab-core/component/ca-lab-instance-status-dialog/ca-lab-instance-status-dialog.component';
import {CaLabInstanceDetailPageState} from '../../state/ca-lab-instance-detail-page.state';
import {ClSubscriptionHandler} from '@monorepo/core-lib';
import {map} from 'rxjs/operators';
import {CaLabInstanceDetailServerState} from '../../state/ca-lab-instance-detail-server.state';
import {
  CaLabPullBiotaFormDialogComponent
} from '../ca-lab-pull-biota-form-dialog/ca-lab-pull-biota-form-dialog.component';

/**
 * Component only accessible by the admin
 */
@Component({
  selector: 'ca-lab-instance-manager',
  templateUrl: './ca-lab-instance-manager.component.html',
  styleUrls: ['./ca-lab-instance-manager.component.scss']
})
export class CaLabInstanceManagerComponent implements OnInit, OnDestroy {

  adminerUrl$: Observable<string>;
  labInstanceId: string = this.state.getLabInstanceId();

  labManagerStatus$: Observable<CaLabManagerStatus>;

  private readonly actionType = 'lab-manager';

  private subscription: ClSubscriptionHandler = new ClSubscriptionHandler();

  constructor(private labInstanceService: CaLabInstanceService,
              private actionService: FlPortalActionsService,
              private dialogService: FlDialogService,
              private state: CaLabInstanceDetailPageState,
              private serverState: CaLabInstanceDetailServerState) {
  }

  ngOnInit(): void {
    // refresh the values on new action result
    this.subscription.add(this.actionService.getResult$(this.actionType).subscribe(
      () => this.refresh()
    ));

    this.subscription.add(this.state.getStatus$().pipe(
      map(status => status.labManagerIsRunning),
      distinct()
    ).subscribe(status => this.refresh(status)));

    this.adminerUrl$ = this.state.getLabInstance$().pipe(
      map(labInstance => labInstance.adminerUrl)
    );
  }

  refresh(isRunning: boolean = true): void {
    if (!isRunning) {
      this.labManagerStatus$ = throwError(() => 'Lab manager is not running');
      return;
    }
    // share() is used to avoid multiple calls to the server
    this.labManagerStatus$ = this.labInstanceService.getLabManagerStatus(this.state.getLabInstanceId())
      .pipe(share());
  }

  openStatusDialog(): void {
    this.dialogService.openMediumDialog(CaLabInstanceStatusDialogComponent, {data: this.state.getLabInstanceId()});
  }

  initAll(): void {
    this.actionService.addAction({
      action: this.labInstanceService.initAll(this.state.getLabInstanceId()),
      text: 'Init all',
      type: this.actionType
    });
  }

  upContainers(): void {
    this.openLabUpForm({mode: 'start'}).subscribe(
      formValue => {
        if (formValue) {
          this.actionService.addAction({
            action: this.labInstanceService.upContainers(this.state.getLabInstanceId(), formValue),
            text: 'Up containers',
            type: this.actionType
          });
        }
      }
    );
  }

  restartContainers(): void {
    this.openLabUpForm({mode: 'restart'}).subscribe(
      formValue => {
        if (formValue) {
          this.actionService.addAction({
            action: this.labInstanceService.restartContainers(this.state.getLabInstanceId(), formValue),
            text: 'Restart containers',
            type: this.actionType
          });
        }
      }
    );
  }

  private openLabUpForm(mode: CaLabInstanceDockerUpFormInput): Observable<CaLabComposeUpOptions> {
    return this.dialogService.openSmallDialog(CaLabInstanceDockerUpFormComponent, {data: mode}).afterClosed();
  }

  downContainers(): void {
    this.actionService.addAction({
      action: this.labInstanceService.downContainers(this.state.getLabInstanceId()),
      text: 'Down containers',
      type: this.actionType
    });
  }

  pullContainers(): void {
    this.actionService.addAction({
      action: this.labInstanceService.pullContainers(this.state.getLabInstanceId()),
      text: 'Pull containers',
      type: this.actionType
    });
  }

  pullBiotaDb(): void {
    this.dialogService.openSmallDialog(CaLabPullBiotaFormDialogComponent).afterClosed().subscribe(
      result => {
        if (result) {
          this.actionService.addAction({
            action: this.labInstanceService.pullBiotaDb(this.state.getLabInstanceId(), result),
            text: {text: 'pull_biota', translateText: true},
            type: this.actionType
          });
        }
      }
    );
  }

  registryLogin(): void {
    this.actionService.addAction({
      action: this.labInstanceService.registryLogin(this.state.getLabInstanceId()),
      text: 'Registry login',
      type: this.actionType
    });
  }

  stopCurrentTask(): void {
    this.actionService.addAction({
      action: this.labInstanceService.stopCurrentTask(this.state.getLabInstanceId()),
      text: 'Stop current task',
      type: this.actionType
    });
  }

  systemPrune(): void {
    this.actionService.addAction({
      action: this.labInstanceService.systemPrune(this.state.getLabInstanceId()),
      text: 'System prune',
      type: this.actionType
    });
  }

  startAdminer(): void {
    this.actionService.addAction({
      action: this.labInstanceService.startAdminer(this.state.getLabInstanceId()),
      text: 'Start adminer',
      type: this.actionType
    });
  }

  stopAdminer(): void {
    this.actionService.addAction({
      action: this.labInstanceService.stopAdminer(this.state.getLabInstanceId()),
      text: 'Stop adminer',
      type: this.actionType
    });
  }

  updateLabManager(labStatus: CaLabManagerStatus): void {
    this.serverState.updateLabManager(labStatus.labManagerVersion, labStatus.labManagerRecommendedVersion);
  }


  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
  }
}
