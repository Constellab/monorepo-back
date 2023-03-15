import {Component, OnInit} from '@angular/core';
import {CaLabManagerStatus} from '../../../ca-core/model/entities/lab/ca-lab-manager.class';
import {CaLabInstanceDetailManagerState} from '../../state/ca-lab-instance-detail-manager.state';
import {Observable} from 'rxjs';
import {map} from 'rxjs/operators';

type CaCurrentStatus = 'NOT_CONFIGURED' | 'NOT_INITIALIZED' | 'NOT_INITIALIZED_SINCE' |
  'SOME_APPS_DOWN' | 'ALL_APPS_DOWN' | 'CONFIGURED';

interface CaCurrentStatusInfo {
  status: CaCurrentStatus;
  text: string;
  icon: string;
  iconClass: string;
  buttonText?: string;
}

/**
 * Simple component to display the lab status via the manager
 */
@Component({
  selector: 'ca-lab-instance-manager-status',
  templateUrl: './ca-lab-instance-manager-status.component.html',
  styleUrls: ['./ca-lab-manager-status.component.scss']
})
export class CaLabInstanceManagerStatusComponent implements OnInit {

  managerStatus$: Observable<CaLabManagerStatus> = this.managerState.getStatus$();

  adminerUrl$: Observable<string> = this.managerState.getRunningAdminerUrl$();

  recommendedVersion$: Observable<string> = this.managerState.getLabManagerRecommendedVersion$();

  currentStatus$: Observable<CaCurrentStatusInfo>;

  constructor(private managerState: CaLabInstanceDetailManagerState) {
  }

  ngOnInit(): void {
    this.currentStatus$ = this.managerStatus$.pipe(
      map(labStatus => this.convertToCurrentStatus(labStatus))
    );
  }

  private convertToCurrentStatus(labStatus: CaLabManagerStatus): CaCurrentStatusInfo {
    if (!labStatus.isConfigured) {
      return {
        status: 'NOT_CONFIGURED',
        text: 'lab_manager_not_configured',
        icon: 'clear',
        iconClass: 'g-warn-text'
      };
    } else if (!labStatus.isInitialized) {
      return {
        status: 'NOT_INITIALIZED',
        text: 'lab_manager_not_initialized',
        icon: 'clear',
        iconClass: 'g-warn-text',
        buttonText: 'lab_manager_initialize'
      };
      // if the lab manager was updated but the init was not done since
    } else if (labStatus.lastInitVersion && labStatus.lastInitVersion !== labStatus.version) {
      return {
        status: 'NOT_INITIALIZED_SINCE',
        text: 'lab_manager_not_initialized_since_new_version',
        icon: 'warnings',
        iconClass: 'g-warn-text',
        buttonText: 'lab_manager_initialize'
      };
    } else if (labStatus.containersStatus.status.value === 'PARTIALLY_UP') {
      return {
        status: 'SOME_APPS_DOWN',
        text: 'lab_manager_some_apps_down',
        icon: 'clear',
        iconClass: 'g-warn-text',
        buttonText: 'lab_manager_restart'
      };
    } else if (labStatus.containersStatus.status.value === 'DOWN' || labStatus.containersStatus.status.value === 'STOP') {
      return {
        status: 'ALL_APPS_DOWN',
        text: 'lab_manager_all_apps_down',
        icon: 'clear',
        iconClass: 'g-warn-text',
        buttonText: 'lab_manager_restart'
      };
    }
    return {
      status: 'CONFIGURED',
      text: 'lab_manager_configured',
      icon: 'check',
      iconClass: 'g-success-text',
      buttonText: 'lab_manager_restart'
    };
  }

  currentStatusAction(buttonText: string): void {
    this.managerState.initAll({text: buttonText, translateText: true});
  }

}
