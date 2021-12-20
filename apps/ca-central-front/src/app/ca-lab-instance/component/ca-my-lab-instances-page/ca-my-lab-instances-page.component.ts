import {Component, OnInit} from '@angular/core';
import {CaLabInstanceDatasource} from '../../../ca-core/model/entities/ca-lab-instance.class';
import {CaLabInstanceService} from '../../../ca-core/service-api/ca-lab-instance.service';

@Component({
  selector: 'ca-my-lab-instances-page',
  templateUrl: './ca-my-lab-instances-page.component.html',
  styleUrls: ['./ca-my-lab-instances-page.component.scss']
})
export class CaMyLabInstancesPageComponent implements OnInit {

  labInstancesDatasource: CaLabInstanceDatasource;

  constructor(private labInstanceService: CaLabInstanceService) {
  }

  ngOnInit(): void {
    this.getMyLabInstances();
  }

  private getMyLabInstances(): void {
    this.labInstancesDatasource = this.labInstanceService.getCurrentLabInstancesDatasource();
  }

}
