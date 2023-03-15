import {Component, Input, OnInit} from '@angular/core';
import {CaLabInstanceService} from '../../../ca-core/service-api/ca-lab-instance.service';
import {Observable} from 'rxjs';
import {CaLabManagerConfig} from '../../../ca-core/model/entities/lab/ca-lab-manager.class';
import {CaLabInstanceDetailManagerState} from '../../state/ca-lab-instance-detail-manager.state';

/**
 * Component to configure the lab instance (bricks)
 */
@Component({
  selector: 'ca-lab-instance-manager-config',
  templateUrl: './ca-lab-instance-manager-config.component.html',
  styleUrls: ['./ca-lab-instance-manager-config.component.scss']
})
export class CaLabInstanceManagerConfigComponent implements OnInit {

  @Input() labInstanceId: string;

  labConfig$: Observable<CaLabManagerConfig>;

  constructor(private labInstanceService: CaLabInstanceService,
              private managerState: CaLabInstanceDetailManagerState) {
  }

  ngOnInit(): void {
    this.labConfig$ = this.labInstanceService.getLabManagerConfig(this.labInstanceId);
  }

  refreshStatus(): void {
    this.managerState.refreshStatus();
  }

}
