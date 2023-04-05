import {Component, OnDestroy, OnInit} from '@angular/core';
import {firstValueFrom, Observable, of, Subscription} from 'rxjs';
import {FlDialogService, FlStatusEvent} from '@monorepo/front-core-lib';
import {
  CaLabInstanceStatusDialogComponent
} from '../../../ca-core/entity-module/ca-lab-core/component/ca-lab-instance-status-dialog/ca-lab-instance-status-dialog.component';
import {CaLabInstanceDetailPageState} from '../../state/ca-lab-instance-detail-page.state';
import {CaLabInstanceDetailServerState} from '../../state/ca-lab-instance-detail-server.state';
import {CaLabInstanceDetailManagerState} from '../../state/ca-lab-instance-detail-manager.state';
import {catchError, map} from 'rxjs/operators';

/**
 * Component only accessible by the admin
 */
@Component({
  selector: 'ca-lab-instance-manager',
  templateUrl: './ca-lab-instance-manager.component.html',
  styleUrls: ['./ca-lab-instance-manager.component.scss']
})
export class CaLabInstanceManagerComponent implements OnInit, OnDestroy {

  labInstanceId: string = this.state.getLabInstanceId();

  labManagerStatus$: Observable<FlStatusEvent> = this.managerState.getStatusEvent$();

  refreshIsLoading: boolean = false;

  private subscription: Subscription;

  constructor(private dialogService: FlDialogService,
              private state: CaLabInstanceDetailPageState,
              private serverState: CaLabInstanceDetailServerState,
              private managerState: CaLabInstanceDetailManagerState) {
  }

  ngOnInit(): void {
    this.managerState.init();

    this.subscription = this.managerState.getStatusEvent$().subscribe(
      statusEvent => {
        if (statusEvent.status === 'success' || statusEvent.status === 'error') {
          this.refreshIsLoading = false;
        }
      }
    );
  }

  refresh(): void {
    this.refreshIsLoading = true;
    this.managerState.refreshStatus();
  }

  openStatusDialog(): void {
    this.dialogService.openMediumDialog(CaLabInstanceStatusDialogComponent, {data: this.state.getLabInstanceId()});
  }

  async updateLabManager(): Promise<void> {
    const recommendedVersion = await firstValueFrom(
      this.managerState.getLabManagerRecommendedVersion$().pipe(
        catchError(() => of(null))
      ));

    const managerVersion = await firstValueFrom(this.managerState.getStatusEvent$()
      .pipe(
        map(statusEvent => {
          if(statusEvent.status !== 'success') {
            return null;
          }else{
            return statusEvent.object.version;
          }
        }),
        catchError(() => of(null))
      ));

    this.serverState.updateLabManager(managerVersion, recommendedVersion);
  }

  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
  }


}
