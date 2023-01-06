import {Component, OnInit} from '@angular/core';
import {CaLabInstanceDetailPageState} from '../../state/ca-lab-instance-detail-page.state';
import {Observable} from 'rxjs';
import {CaLabInstanceStatusDTO} from '../../../ca-core/model/entities/lab/ca-lab-instance.class';
import {CaLabInstanceDetailServerState} from '../../state/ca-lab-instance-detail-server.state';


@Component({
  selector: 'ca-lab-instance-server',
  templateUrl: './ca-lab-instance-server.component.html',
  styleUrls: ['./ca-lab-instance-server.component.scss']
})
export class CaLabInstanceServerComponent implements OnInit {

  status$: Observable<CaLabInstanceStatusDTO> = this.state.getStatus$();
  isOwner$: Observable<boolean> = this.state.isLabOwner$();

  constructor(private state: CaLabInstanceDetailPageState,
              private serverState: CaLabInstanceDetailServerState) {
  }

  ngOnInit(): void {
  }

  openServerInfoDialog(): void {
    this.serverState.openServerInfoDialog();
  }

  initServer(): void {
    this.serverState.initServer();
  }

  createServer(): void {
    this.serverState.createServer();
  }

  configureServer(): void {
    this.serverState.configureServer();
  }

  forceStatusRefresh(): void {
    this.serverState.refreshStatus();
  }

  deleteServer(): void {
    this.serverState.deleteServer();
  }

}
