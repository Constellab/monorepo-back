import {Component, Input, OnInit} from '@angular/core';
import {CaLabDockerPs} from '../../../ca-core/model/entities/lab/ca-lab-manager.class';
import {FlDialogService} from '@monorepo/front-core-lib';
import {
  CaLabDockerContainerLogsComponent,
  CaLabDockerContainerLogsInput
} from '../ca-lab-docker-container-logs/ca-lab-docker-container-logs.component';
import {ClHelpService} from '@monorepo/core-lib';

/**
 * Component to list the docker container with name, status and informations
 */
@Component({
  selector: 'ca-lab-docker-containers-list',
  templateUrl: './ca-lab-docker-containers-list.component.html',
  styleUrls: ['./ca-lab-docker-containers-list.component.scss']
})
export class CaLabDockerContainersListComponent implements OnInit {

  @Input() labInstanceId: string;
  @Input() containers: CaLabDockerPs[];

  constructor(private dialogService: FlDialogService) {
  }

  ngOnInit(): void {
  }

  viewContainerLogs(container: CaLabDockerPs, mouseEvent: MouseEvent): void {
    ClHelpService.stopEventPropagation(mouseEvent);
    const input: CaLabDockerContainerLogsInput = {
      labInstanceId: this.labInstanceId,
      containerName: container.names
    };

    this.dialogService.openMediumDialog(CaLabDockerContainerLogsComponent, {data: input});
  }

}
