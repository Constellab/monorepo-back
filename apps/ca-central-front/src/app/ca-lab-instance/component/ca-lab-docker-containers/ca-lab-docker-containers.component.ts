import {Component, OnInit} from '@angular/core';
import {Observable, of} from 'rxjs';
import {CaLabDockerPs} from '../../../ca-core/model/entities/lab/ca-lab-manager.class';
import {CaLabInstanceService} from '../../../ca-core/service-api/ca-lab-instance.service';
import {CaLabInstanceDetailPageState} from '../../state/ca-lab-instance-detail-page.state';

@Component({
  selector: 'ca-lab-docker-containers',
  templateUrl: './ca-lab-docker-containers.component.html',
  styleUrls: ['./ca-lab-docker-containers.component.scss']
})
export class CaLabDockerContainersComponent implements OnInit {

  // don't load containers on init, wait for the user to click on refresh
  containers$: Observable<CaLabDockerPs[]> = of([]);

  labInstanceId: string = this.state.getLabInstanceId();

  constructor(private labInstanceService: CaLabInstanceService,
              private state: CaLabInstanceDetailPageState) {
  }

  ngOnInit(): void {
  }

  refresh(): void {
    this.containers$ = this.labInstanceService.listContainers(this.state.getLabInstanceId());
  }
}
