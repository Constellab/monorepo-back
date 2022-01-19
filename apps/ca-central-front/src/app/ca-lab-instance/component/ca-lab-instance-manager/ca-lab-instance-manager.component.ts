import {Component, Input, OnDestroy, OnInit} from '@angular/core';
import {CaLabInstanceService} from '../../../ca-core/service-api/ca-lab-instance.service';
import {Observable, Subscription} from 'rxjs';
import {
  CaLabComposeUpOptions,
  CaLabDockerPs,
  CnLabManagerStatus
} from '../../../ca-core/model/entities/ca-lab-manager.class';
import {FlDialogService, FlPortalActionsService} from '@monorepo/front-core-lib';
import {
  CaLabInstanceDockerUpFormComponent
} from '../ca-lab-instance-docker-up-form/ca-lab-instance-docker-up-form.component';
import {
  CaLabInstanceStatusDialogComponent
} from '../../../ca-core/entity-module/ca-lab-core/component/ca-lab-instance-status-dialog/ca-lab-instance-status-dialog.component';

/**
 * Component only accessible by the admin
 */
@Component({
  selector: 'ca-lab-instance-manager',
  templateUrl: './ca-lab-instance-manager.component.html',
  styleUrls: ['./ca-lab-instance-manager.component.scss']
})
export class CaLabInstanceManagerComponent implements OnInit, OnDestroy {

  @Input() labInstanceId: string;

  labStatus$: Observable<CnLabManagerStatus>;
  containers$: Observable<CaLabDockerPs[]>;

  private readonly actionType = 'lab-manager';

  private subscription: Subscription;

  constructor(private labInstanceService: CaLabInstanceService,
              private actionService: FlPortalActionsService,
              private dialogService: FlDialogService) {
  }

  ngOnInit(): void {
    // refresh the values on new action result
    this.subscription = this.actionService.getResult$(this.actionType).subscribe(
      () => this.refresh()
    );

    this.refresh();
  }

  refresh(): void {
    this.labStatus$ = this.labInstanceService.getLabManagerStatus(this.labInstanceId);
    this.containers$ = this.labInstanceService.listContainers(this.labInstanceId);
  }

  openStatusDialog(): void {
    this.dialogService.openMediumDialog(CaLabInstanceStatusDialogComponent, {data: this.labInstanceId});
  }

  initAll(): void {
    this.actionService.addAction({
      action: this.labInstanceService.initAll(this.labInstanceId),
      text: 'Init all',
      type: this.actionType
    });
  }

  upContainers(): void {
    this.openLabUpForm().subscribe(
      formValue => {
        if (formValue) {
          this.actionService.addAction({
            action: this.labInstanceService.upContainers(this.labInstanceId, formValue),
            text: 'Up containers',
            type: this.actionType
          });
        }
      }
    );
  }

  restartContainers(): void {
    this.openLabUpForm().subscribe(
      formValue => {
        if (formValue) {
          this.actionService.addAction({
            action: this.labInstanceService.restartContainers(this.labInstanceId, formValue),
            text: 'Restart containers',
            type: this.actionType
          });
        }
      }
    );
  }

  private openLabUpForm(): Observable<CaLabComposeUpOptions> {
    return this.dialogService.openSmallDialog(CaLabInstanceDockerUpFormComponent).afterClosed();
  }

  downContainers(): void {
    this.actionService.addAction({
      action: this.labInstanceService.downContainers(this.labInstanceId),
      text: 'Down containers',
      type: this.actionType
    });
  }

  pullContainers(): void {
    this.actionService.addAction({
      action: this.labInstanceService.pullContainers(this.labInstanceId),
      text: 'Pull containers',
      type: this.actionType
    });
  }

  pullBiotaDb(): void {
    this.actionService.addAction({
      action: this.labInstanceService.pullBiotaDb(this.labInstanceId),
      text: 'Pull biota db',
      type: this.actionType
    });
  }

  registryLogin(): void {
    this.actionService.addAction({
      action: this.labInstanceService.registryLogin(this.labInstanceId),
      text: 'Registry login',
      type: this.actionType
    });
  }

  stopCurrentTask(): void {
    this.actionService.addAction({
      action: this.labInstanceService.stopCurrentTask(this.labInstanceId),
      text: 'Stop current task',
      type: this.actionType
    });
  }

  systemPrune(): void {
    this.actionService.addAction({
      action: this.labInstanceService.systemPrune(this.labInstanceId),
      text: 'System prune',
      type: this.actionType
    });
  }


  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
  }
}
