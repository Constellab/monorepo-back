import { Component, OnInit } from '@angular/core';
import {CaLabInstanceDetailPageState} from '../../state/ca-lab-instance-detail-page.state';
import {Observable} from 'rxjs';
import {CaLabInstanceStatusDTO} from '../../../ca-core/model/entities/lab/ca-lab-instance.class';

/**
 * Component to show global information about the lab instance status
 */
@Component({
  selector: 'ca-lab-instance-global-status',
  templateUrl: './ca-lab-instance-global-status.component.html',
  styleUrls: ['./ca-lab-instance-global-status.component.scss']
})
export class CaLabInstanceGlobalStatusComponent implements OnInit {

  status$: Observable<CaLabInstanceStatusDTO> = this.state.getStatus$();

  labInstanceId: string = this.state.getLabInstanceId();

  constructor(private state: CaLabInstanceDetailPageState) { }

  ngOnInit(): void {
  }

  forceStatusRefresh(): void {
    this.state.refreshStatus();
  }

}
