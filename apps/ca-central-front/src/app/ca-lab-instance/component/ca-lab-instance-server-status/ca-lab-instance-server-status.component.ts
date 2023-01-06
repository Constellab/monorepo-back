import {Component, OnInit} from '@angular/core';
import {CaLabInstanceDetailPageState} from '../../state/ca-lab-instance-detail-page.state';
import {Observable} from 'rxjs';
import {CaLabInstanceStatusDTO} from '../../../ca-core/model/entities/lab/ca-lab-instance.class';
import {map} from 'rxjs/operators';
import {CaLabInstanceDetailServerState} from '../../state/ca-lab-instance-detail-server.state';

type CaServerStatus = 'SERVER_NOT_CREATED' | 'LAB_MANAGER_NOT_AVAILABLE' | 'LAB_NOT_AVAILABLE' | 'LAB_RUNNING';

@Component({
  selector: 'ca-lab-instance-server-status',
  templateUrl: './ca-lab-instance-server-status.component.html',
  styleUrls: ['./ca-lab-instance-server-status.component.scss']
})
export class CaLabInstanceServerStatusComponent implements OnInit {

  status$: Observable<CaServerStatus>;

  labInstanceId: string = this.state.getLabInstanceId();

  constructor(private state: CaLabInstanceDetailPageState,
              private serverState: CaLabInstanceDetailServerState) {
  }

  ngOnInit(): void {
    this.status$ = this.state.getStatus$().pipe(map(status => this.convertStatusMessage(status)));
  }

  private convertStatusMessage(status: CaLabInstanceStatusDTO): CaServerStatus {
    if (!status.hasServerInstanceId || !status.hasServerVolumeId) {
      return 'SERVER_NOT_CREATED';
    } else if (!status.labManagerIsRunning) {
      return 'LAB_MANAGER_NOT_AVAILABLE';
    } else if (!status.labIsRunning) {
      return 'LAB_NOT_AVAILABLE';
    } else {
      return 'LAB_RUNNING';
    }
  }

  initServer(): void {
    this.serverState.initServer();
  }

  configureServer(): void {
    this.serverState.configureServer();
  }

  moveToLabManager(): void {
    if(document){
      const element = document.getElementById('lab-manager');
      if(element){
        element.scrollIntoView({behavior: 'smooth'});
      }
    }
  }

}
