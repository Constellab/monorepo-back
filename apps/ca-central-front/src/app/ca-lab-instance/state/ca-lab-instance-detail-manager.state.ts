import {Injectable, OnDestroy} from '@angular/core';
import {CaLabInstanceService} from '../../ca-core/service-api/ca-lab-instance.service';
import {CaLabInstanceDetailPageState} from './ca-lab-instance-detail-page.state';
import {
  FlDialogService,
  FlPortalActionsService,
  FlStatusEvent,
  flStatutEventSuccess,
  FlTranslatableText
} from '@monorepo/front-core-lib';
import {BehaviorSubject, distinct, mergeMap, Observable, of, share, Subscription} from 'rxjs';
import {
  CaLabComposeUpOptions,
  CaLabManagerRecommendedVersion,
  CaLabManagerStatus
} from '../../ca-core/model/entities/lab/ca-lab-manager.class';
import {map} from 'rxjs/operators';
import {
  CaLabInstanceDockerUpFormComponent,
  CaLabInstanceDockerUpFormInput
} from '../component/ca-lab-instance-docker-up-form/ca-lab-instance-docker-up-form.component';
import {
  CaLabPullBiotaFormDialogComponent
} from '../component/ca-lab-pull-biota-form-dialog/ca-lab-pull-biota-form-dialog.component';

/**
 * State in the lab instance detail page for the lab manager.
 */
@Injectable()
export class CaLabInstanceDetailManagerState implements OnDestroy {

  private status$: BehaviorSubject<FlStatusEvent<CaLabManagerStatus>>
    = new BehaviorSubject({status: 'waiting'});

  private labManagerRecommendedVersion$: Observable<string>;

  private initialized = false;

  private readonly actionType = 'lab-manager';

  private actionSubscription: Subscription;

  private autoRefreshFrequency = 15000;
  private autoRefreshTimeout: any;


  constructor(private state: CaLabInstanceDetailPageState,
              private labInstanceService: CaLabInstanceService,
              private dialogService: FlDialogService,
              private portalService: FlPortalActionsService,
              private actionService: FlPortalActionsService) {
  }

  public init(): void {
    if (!this.initialized) {
      this.initialized = true;

      this.state.getStatus$().pipe(
        // refresh the status when the lab manager is running has changed
        map(status => status.labManagerIsRunning),
        distinct(),
      ).subscribe({
        next: () => this.refreshStatus(),
        error: (error) => this.status$.next({status: 'error', error})
      });

      // refresh the values on new action result
      this.actionSubscription = this.actionService.getResult$(this.actionType).subscribe(
        () => this.refreshStatus()
      );
    }
  }

  public refreshStatus(): void {
    if (this.status$.value.status === 'loading') return;
    if (this.autoRefreshTimeout) {
      clearTimeout(this.autoRefreshTimeout);
      this.autoRefreshTimeout = null;
    }

    this.status$.next({status: 'loading'});
    this.labInstanceService.getLabManagerStatus(this.state.getLabInstanceId()).subscribe({
      next: (status: CaLabManagerStatus) => this.refreshStatusSuccess(status),
      error: (error) => this.status$.next({status: 'error', error})
    });
  }

  private refreshStatusSuccess(status: CaLabManagerStatus): void {
    this.status$.next({
      status: 'success',
      object: status
    });

    if (status.currentTask?.status.value === 'RUNNING') {
      this.autoRefreshTimeout = setTimeout(() => this.refreshStatus(), this.autoRefreshFrequency);
    }
  }

  public getStatusEvent$(): Observable<FlStatusEvent> {
    return this.status$.asObservable();
  }


  public getStatus$(): Observable<CaLabManagerStatus> {
    return this.status$.asObservable().pipe(
      flStatutEventSuccess(),
    );
  }

  /**
   * If the adminer service is running, returns the URL of the adminer service.
   */
  public getRunningAdminerUrl$(): Observable<string> {
    return this.getStatus$().pipe(
      map((status: CaLabManagerStatus) => status.adminerIsRunning),
      mergeMap((adminerIsRunning: boolean) => {
        if (!adminerIsRunning) return of(null);
        return this.state.getLabInstance$().pipe(
          map(labInstance => labInstance.adminerUrl)
        );
      })
    );
  }

  public getLabManagerRecommendedVersion$(): Observable<string> {
    if (!this.labManagerRecommendedVersion$) {
      this.labManagerRecommendedVersion$ = this.labInstanceService.getLabManagerRecommendedVersion().pipe(
        share(),
        map((version: CaLabManagerRecommendedVersion) => version.labManagerRecommendedVersion)
      );
    }
    return this.labManagerRecommendedVersion$;
  }

  //////////////////////////// Actions ////////////////////////////
  initAll(actionText: FlTranslatableText = 'Init all'): void {
    this.actionService.addAction({
      action: this.labInstanceService.initAll(this.state.getLabInstanceId()),
      text: actionText,
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

  ngOnDestroy(): void {
    this.actionSubscription?.unsubscribe();
  }


}
