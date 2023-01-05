import {Component, Input, OnDestroy, OnInit} from '@angular/core';
import {CaLabInstanceService} from '../../../ca-core/service-api/ca-lab-instance.service';
import {distinct, Observable, throwError} from 'rxjs';
import {CaLabComposeUpOptions, CaLabManagerStatus} from '../../../ca-core/model/entities/lab/ca-lab-manager.class';
import {FlDialogService, FlPortalActionsService} from '@monorepo/front-core-lib';
import {
  CaLabInstanceDockerUpFormComponent
} from '../ca-lab-instance-docker-up-form/ca-lab-instance-docker-up-form.component';
import {
  CaLabInstanceStatusDialogComponent
} from '../../../ca-core/entity-module/ca-lab-core/component/ca-lab-instance-status-dialog/ca-lab-instance-status-dialog.component';
import {CaLabInstance} from '../../../ca-core/model/entities/lab/ca-lab-instance.class';
import {CaLabInstanceDetailPageState} from '../../state/ca-lab-instance-detail-page.state';
import {ClSubscriptionHandler} from '@monorepo/core-lib';
import {map} from 'rxjs/operators';

/**
 * Component only accessible by the admin
 */
@Component({
  selector: 'ca-lab-instance-manager',
  templateUrl: './ca-lab-instance-manager.component.html',
  styleUrls: ['./ca-lab-instance-manager.component.scss']
})
export class CaLabInstanceManagerComponent implements OnInit, OnDestroy {

  @Input() labInstance: CaLabInstance;

  labManagerStatus$: Observable<CaLabManagerStatus>;

  private readonly actionType = 'lab-manager';

  private subscription: ClSubscriptionHandler = new ClSubscriptionHandler();

  constructor(private labInstanceService: CaLabInstanceService,
              private actionService: FlPortalActionsService,
              private dialogService: FlDialogService,
              private state: CaLabInstanceDetailPageState) {
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
  }

  refresh(isRunning: boolean = true): void {
    if(!isRunning) {
      this.labManagerStatus$ = throwError(() => 'Lab manager is not running');
      return;
    }
    this.labManagerStatus$ = this.labInstanceService.getLabManagerStatus(this.labInstance.id);
  }

  openStatusDialog(): void {
    this.dialogService.openMediumDialog(CaLabInstanceStatusDialogComponent, {data: this.labInstance.id});
  }

  initAll(): void {
    this.actionService.addAction({
      action: this.labInstanceService.initAll(this.labInstance.id),
      text: 'Init all',
      type: this.actionType
    });
  }

  upContainers(): void {
    this.openLabUpForm().subscribe(
      formValue => {
        if (formValue) {
          this.actionService.addAction({
            action: this.labInstanceService.upContainers(this.labInstance.id, formValue),
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
            action: this.labInstanceService.restartContainers(this.labInstance.id, formValue),
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
      action: this.labInstanceService.downContainers(this.labInstance.id),
      text: 'Down containers',
      type: this.actionType
    });
  }

  pullContainers(): void {
    this.actionService.addAction({
      action: this.labInstanceService.pullContainers(this.labInstance.id),
      text: 'Pull containers',
      type: this.actionType
    });
  }

  pullBiotaDb(): void {
    this.actionService.addAction({
      action: this.labInstanceService.pullBiotaDb(this.labInstance.id),
      text: 'Pull biota db',
      type: this.actionType
    });
  }

  registryLogin(): void {
    this.actionService.addAction({
      action: this.labInstanceService.registryLogin(this.labInstance.id),
      text: 'Registry login',
      type: this.actionType
    });
  }

  stopCurrentTask(): void {
    this.actionService.addAction({
      action: this.labInstanceService.stopCurrentTask(this.labInstance.id),
      text: 'Stop current task',
      type: this.actionType
    });
  }

  systemPrune(): void {
    this.actionService.addAction({
      action: this.labInstanceService.systemPrune(this.labInstance.id),
      text: 'System prune',
      type: this.actionType
    });
  }

  startAdminer(): void {
    this.actionService.addAction({
      action: this.labInstanceService.startAdminer(this.labInstance.id),
      text: 'Start adminer',
      type: this.actionType
    });
  }

  stopAdminer(): void {
    this.actionService.addAction({
      action: this.labInstanceService.stopAdminer(this.labInstance.id),
      text: 'Stop adminer',
      type: this.actionType
    });
  }


  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
  }
}
