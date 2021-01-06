import {Component, OnInit} from '@angular/core';
import {LabInstanceDatasource} from '../../../core/model/entities/lab-instance.class';
import {LabInstanceService} from '../../../core/service-api/lab-instance.service';

@Component({
  selector: 'gen-my-lab-instances-page',
  templateUrl: './my-lab-instances-page.component.html',
  styleUrls: ['./my-lab-instances-page.component.scss']
})
export class MyLabInstancesPageComponent implements OnInit {

  labInstancesDatasource: LabInstanceDatasource;

  constructor(private labInstanceService: LabInstanceService) {
  }

  ngOnInit(): void {
    this.getMyLabInstances();
  }

  private getMyLabInstances(): void {
    this.labInstancesDatasource = this.labInstanceService.getCurrentLabInstancesDatasource();
  }

}
