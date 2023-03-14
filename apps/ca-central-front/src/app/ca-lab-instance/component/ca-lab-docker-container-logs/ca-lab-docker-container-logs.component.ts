import {Component, Inject, OnInit} from '@angular/core';
import {CaLabInstanceService} from '../../../ca-core/service-api/ca-lab-instance.service';
import {Observable} from 'rxjs';
import {MAT_DIALOG_DATA} from '@angular/material/dialog';

export interface CaLabDockerContainerLogsInput {
  labInstanceId: string;
  containerName: string;
}

/**
 * Dialog to view logs of a docker container
 */
@Component({
  selector: 'ca-lab-docker-container-logs',
  templateUrl: './ca-lab-docker-container-logs.component.html',
  styleUrls: ['./ca-lab-docker-container-logs.component.scss']
})
export class CaLabDockerContainerLogsComponent implements OnInit {

  logs$: Observable<string>;
  containerName: string;

  constructor(@Inject(MAT_DIALOG_DATA) private input: CaLabDockerContainerLogsInput,
              private labInstanceService: CaLabInstanceService) {
  }

  ngOnInit(): void {
    this.containerName = this.input.containerName;
    this.logs$ = this.labInstanceService.getLogs(this.input.labInstanceId, this.input.containerName);
  }

}
